#!/bin/bash
# Deployed-site checks with curl. Usage: curl.sh https://host  (writes to stdout)
set -u
U="$1"; W=$(mktemp -d)
echo "== home =="; curl -s -o $W/home.html -w "%{http_code} %{time_total}s %{size_download} B\n" "$U/"
grep -o 'aria-label="Rated[^"]*"' $W/home.html; grep -o '<link rel="canonical"[^>]*>' $W/home.html
echo "injected bot-detection script tags: $(grep -c 'cdn-cgi/challenge-platform' $W/home.html)"
echo "== headers, first and second request =="; for i in 1 2; do curl -sI "$U/" | grep -iE "^(HTTP|server|cf-ray|cf-cache-status|cache-control|x-nextjs-cache|x-opennext|content-type)" | tr '\n' ' '; echo; done
echo "== redirect and privacy =="; curl -s -o /dev/null -w "/privacy.html %{http_code} -> %{redirect_url}\n" "$U/privacy.html"; curl -s -o /dev/null -w "/privacy %{http_code}\n" "$U/privacy"; curl -s -o /dev/null -w "/privacy/ %{http_code} -> %{redirect_url}\n" "$U/privacy/"; curl -s "$U/privacy" | grep -o '<link rel="canonical"[^>]*>'
echo "== sitemap and robots =="; curl -s -o /dev/null -w "sitemap %{http_code} %{content_type}\n" "$U/sitemap.xml"; curl -s "$U/sitemap.xml" | tr -d '\n' | cut -c1-260; echo; curl -s -o /dev/null -w "robots %{http_code} %{content_type}\n" "$U/robots.txt"; curl -s "$U/robots.txt"
echo "== image route by Accept =="; for a in "image/avif,image/webp,*/*" "image/webp,*/*" "image/jpeg,*/*"; do curl -s -o /dev/null -w "Accept: $a -> %{http_code} %{content_type} %{size_download} B\n" -H "Accept: $a" "$U/img/gallery-04-384.jpg?v=x"; done
curl -sI -H "Accept: image/avif" "$U/img/gallery-04-384.jpg" | grep -iE "^(cache-control|vary|cf-cache-status)"
echo "== static chunk caching =="; f=$(grep -o '/_next/static/chunks/[A-Za-z0-9_.-]*\.js' $W/home.html | head -1); curl -sI "$U$f" | grep -iE "^(HTTP|cache-control|cf-cache-status)"
echo "== availability api (read-only) =="; curl -s -o /dev/null -w "%{http_code}\n" "$U/api/bookings?date=$(date -d '+3 days' +%F)"
echo "tomorrow, per area: $(curl -s "$U/api/bookings?date=$(date -d '+1 day' +%F)" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["date"], [(s["time"], s["remaining"]) for s in d["slots"]])')"
echo "== schema.org validator =="; curl -s -X POST "https://validator.schema.org/validate" -d "url=$U/" | sed "s/^)]}'//" | python3 -c 'import json,sys; d=json.load(sys.stdin); print("rendered:",d.get("isRendered"),"objects:",d.get("numObjects"),"types:",[t["value"] for g in d["tripleGroups"] for n in g["nodes"] for t in n["types"]],"totalNumErrors:",d.get("totalNumErrors"),"totalNumWarnings:",d.get("totalNumWarnings"))'
