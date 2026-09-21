#!/bin/bash
# Booking checks against a deployed address, split into parts that each stay within the
# rate limit of five posts per address per ten minutes; the workflow runs each part on
# its own runner. Usage: booking.sh https://host <part>
# Parts: persist | capacity | race | validation | limit | second-address | cleanup
# Needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID for the database reads.
set -u
B="$1/api/bookings"; PART="$2"; W=$(mktemp -d)
post() { curl -s -w "\n%{http_code}" -H "content-type: application/json" -d "$1" "$B"; }
body() { echo "{\"name\":\"$1\",\"partySize\":\"$2\",\"date\":\"$3\",\"time\":\"$4\",\"phone\":\"+44 1392 000000\",\"email\":\"\",\"note\":\"\",\"website\":\"\"}"; }
rows() { npx wrangler d1 execute DB --remote --json --command "$1" 2>/dev/null | python3 -c 'import json,sys; print(json.dumps(json.load(sys.stdin)[0]["results"]))'; }
D1=$(date -d '+4 days' +%F); D2=$(date -d '+5 days' +%F); D3=$(date -d '+6 days' +%F)
echo "runner address: $(curl -s https://api.ipify.org)"
case "$PART" in
persist)
  echo "== 1. a booking persists ($D1 12:00) =="; post "$(body 'Test Persist' 2 $D1 12:00)"; echo
  echo "database: $(rows "select id,name,party_size,date,time,status from bookings where date='$D1'")"
  echo "availability 12:00: $(curl -s "$B?date=$D1" | python3 -c 'import json,sys; print([s for s in json.load(sys.stdin)["slots"] if s["time"]=="12:00"])')"
  ;;
capacity)
  echo "== 2. filling a slot to capacity ($D2 12:00) =="
  post "$(body 'Test Six' 6 $D2 12:00)" | tail -1; echo -n " "; post "$(body 'Test Six B' 6 $D2 12:00)" | tail -1; echo "  (12 of 12)"
  echo "party of 1: $(post "$(body 'Test One' 1 $D2 12:00)" | head -1)"
  echo "== 2b. two seats left ($D2 14:00) =="
  post "$(body 'Test Six C' 6 $D2 14:00)" | tail -1; echo -n " "; post "$(body 'Test Four' 4 $D2 14:00)" | tail -1; echo "  (10 of 12)"
  ;;
validation)
  echo "== 4. field-level rejections =="
  echo "outside hours 07:00:   $(post "$(body 'Val One' 2 $D1 07:00)" | head -1)"
  echo "inside notice (today $(TZ=Europe/London date +%H:%M) London, 08:00): $(post "$(body 'Val Two' 2 $(TZ=Europe/London date +%F) 08:00)" | head -1)"
  echo "beyond window:         $(post "$(body 'Val Three' 2 $(date -d '+40 days' +%F) 12:00)" | head -1)"
  echo "party of 7:            $(post "$(body 'Val Four' 7 $D1 12:00)" | head -1)"
  # The capacity part, on another runner, fills $D2 14:00 to 10 covers; wait for it so
  # this last post meets exactly two seats left.
  for i in $(seq 1 48); do c=$(rows "select coalesce(sum(party_size),0) as c from bookings where date='$D2' and time='14:00'" | python3 -c 'import json,sys; print(json.load(sys.stdin)[0]["c"])'); [ "$c" -ge 10 ] && break; sleep 5; done
  echo "covers at $D2 14:00 before the post: $c"
  echo "party of 3 with 2 left ($D2 14:00): $(post "$(body 'Test Three' 3 $D2 14:00)" | head -1)"
  ;;
race)
  echo "== 3. two simultaneous requests for the last cover ($D3 10:00) =="
  post "$(body 'Race Six' 6 $D3 10:00)" | tail -1; echo -n " "; post "$(body 'Race Five' 5 $D3 10:00)" | tail -1; echo "  (11 of 12)"
  post "$(body 'Race Alpha' 1 $D3 10:00)" > $W/a & post "$(body 'Race Bravo' 1 $D3 10:00)" > $W/b & wait
  echo "A: $(tail -1 $W/a) $(head -1 $W/a | cut -c1-90)"; echo "B: $(tail -1 $W/b) $(head -1 $W/b | cut -c1-90)"
  echo "database: $(rows "select count(*) as rows_, sum(party_size) as covers from bookings where date='$D3' and time='10:00'")"
  ;;
limit)
  echo "== 5. the rate limit from one address =="
  echo -n "five invalid posts: "; for i in 1 2 3 4 5; do post "$(body '' 2 $D1 13:00)" | tail -1 | tr '\n' ' '; done; echo
  echo "sixth:"; curl -s -D - -o /dev/null -H "content-type: application/json" -d "$(body 'Rate Test' 2 $D1 13:00)" "$B" | grep -iE "^HTTP|retry-after"
  echo "seventh, with a forged x-forwarded-for header (expected 429: the header is ignored):"
  curl -s -D - -o /dev/null -H "content-type: application/json" -H "x-forwarded-for: 198.51.100.99" -d "$(body 'Rate Test' 2 $D1 13:00)" "$B" | grep -iE "^HTTP|retry-after"
  echo "eighth, with a forged cf-connecting-ip header (expected 403: the edge refuses it before the Worker sees it):"
  curl -s -D - -o /dev/null -H "content-type: application/json" -H "cf-connecting-ip: 198.51.100.98" -d "$(body 'Rate Test' 2 $D1 13:00)" "$B" | grep -iE "^HTTP|retry-after"
  echo "database, this address's hits: $(rows "select address, count(*) as hits from rate_limit_hits group by address")"
  echo "waiting for the window to pass (605 s)…"; sleep 605
  echo "after the window, an invalid post (expected 400, not 429): $(post "$(body '' 2 $D1 13:00)" | tail -1)"
  ;;
second-address)
  echo "== 5b. a second address while the first is limited =="
  sleep 150
  echo "one post from this runner (expected 400 for the empty name, not 429): $(post "$(body '' 2 $D1 13:00)" | tail -1)"
  echo "addresses in the table: $(rows "select address, count(*) as hits from rate_limit_hits group by address")"
  ;;
cleanup)
  echo "== 6. removing the test rows =="
  rows "delete from bookings where name like 'Test %' or name like 'Race %' or name like 'Val %' or name like 'Rate Test%'" >/dev/null
  rows "delete from rate_limit_hits" >/dev/null
  echo "bookings after clean-up: $(rows 'select count(*) as n from bookings'), rate_limit_hits: $(rows 'select count(*) as n from rate_limit_hits')"
  ;;
esac
