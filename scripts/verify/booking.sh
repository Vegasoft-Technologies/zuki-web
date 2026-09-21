#!/bin/bash
# Booking checks against a deployed address. Usage: booking.sh https://host
# Needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID for the database reads.
set -u
B="$1/api/bookings"; W=$(mktemp -d)
post() { curl -s -w "\n%{http_code}" -H "content-type: application/json" -H "x-forwarded-for: $1" -d "$2" "$B"; }
body() { echo "{\"name\":\"$1\",\"partySize\":\"$2\",\"date\":\"$3\",\"time\":\"$4\",\"phone\":\"+44 1392 000000\",\"email\":\"\",\"note\":\"\",\"website\":\"\"}"; }
rows() { npx wrangler d1 execute DB --remote --json --command "$1" 2>/dev/null | python3 -c 'import json,sys; print(json.dumps(json.load(sys.stdin)[0]["results"]))'; }
D1=$(date -d '+4 days' +%F); D2=$(date -d '+5 days' +%F)
echo "== 0. rows before: $(rows 'select count(*) as n from bookings') =="
echo "== 1. a booking persists ($D1 12:00) =="; post 198.51.100.1 "$(body 'Test Persist' 2 $D1 12:00)"; echo
echo "database: $(rows "select id,name,party_size,date,time,status from bookings where date='$D1'")"
echo "availability 12:00: $(curl -s "$B?date=$D1" | python3 -c 'import json,sys; print([s for s in json.load(sys.stdin)["slots"] if s["time"]=="12:00"])')"
echo; echo "== 2. filling the slot to capacity =="
post 198.51.100.2 "$(body 'Test Six' 6 $D1 12:00)" | tail -1; echo -n " "; post 198.51.100.3 "$(body 'Test Four' 4 $D1 12:00)" | tail -1; echo "  (12 of 12)"
echo "party of 1: $(post 198.51.100.4 "$(body 'Test One' 1 $D1 12:00)" | head -1)"
post 198.51.100.5 "$(body 'Test Six B' 6 $D1 14:00)" | tail -1; echo -n " "; post 198.51.100.6 "$(body 'Test Four B' 4 $D1 14:00)" | tail -1; echo "  (10 of 12 at 14:00)"
echo "party of 3 with 2 left: $(post 198.51.100.7 "$(body 'Test Three' 3 $D1 14:00)" | head -1)"
echo; echo "== 3. two simultaneous requests for the last cover ($D2 10:00) =="
post 198.51.100.8 "$(body 'Race Six' 6 $D2 10:00)" >/dev/null; post 198.51.100.9 "$(body 'Race Five' 5 $D2 10:00)" >/dev/null
post 198.51.100.10 "$(body 'Race Alpha' 1 $D2 10:00)" > $W/a & post 198.51.100.11 "$(body 'Race Bravo' 1 $D2 10:00)" > $W/b & wait
echo "A: $(tail -1 $W/a) $(head -1 $W/a | cut -c1-90)"; echo "B: $(tail -1 $W/b) $(head -1 $W/b | cut -c1-90)"
echo "database: $(rows "select count(*) as rows_, sum(party_size) as covers from bookings where date='$D2' and time='10:00'")"
echo; echo "== 4. field-level rejections =="
echo "outside hours 07:00:   $(post 198.51.100.12 "$(body 'Val One' 2 $D1 07:00)" | head -1)"
echo "inside notice (today $(TZ=Europe/London date +%H:%M) London, 08:00): $(post 198.51.100.13 "$(body 'Val Two' 2 $(TZ=Europe/London date +%F) 08:00)" | head -1)"
echo "beyond window:         $(post 198.51.100.14 "$(body 'Val Three' 2 $(date -d '+40 days' +%F) 12:00)" | head -1)"
echo "party of 7:            $(post 198.51.100.15 "$(body 'Val Four' 7 $D1 12:00)" | head -1)"
echo; echo "== 5. rate limit: eight invalid posts from one address, then a valid one =="
for i in 1 2 3 4 5 6 7 8; do post 198.51.100.99 "$(body '' 2 $D1 13:00)" | tail -1 | tr '\n' ' '; done; echo
curl -s -D - -o /dev/null -H "content-type: application/json" -H "x-forwarded-for: 198.51.100.99" -d "$(body 'Rate Test' 2 $D1 13:00)" "$B" | grep -iE "^HTTP|retry-after"
echo "same request without the header (runner's own address): $(curl -s -o /dev/null -w '%{http_code}' -H 'content-type: application/json' -d "$(body 'Rate Test B' 2 $D1 13:30)" "$B")"
echo; echo "rows now: $(rows 'select count(*) as n from bookings')"
