# Baseline measurements

Figures recorded from the production site at https://zukiscaffetteria.co.uk before and
during the migration. Each entry carries the date it was taken. These numbers are
requirements, not observations: the migrated site must not regress against them.

## Client-supplied baseline of the production implementation

Measured by the client before the migration began.

| Metric         | Value   |
| -------------- | ------- |
| Download time  | 0.532 s |
| Page load time | 0.198 s |
| HTTP requests  | 19      |

## 2026-09-18 — Recovery of the production source

The production files were downloaded into `reference/`, which is a byte-exact copy of
what the live server serves. It is the source of truth for appearance and is never
edited.

| File           | Size        |
| -------------- | ----------- |
| `index.html`   | 54,758 B    |
| `styles.css`   | 27,880 B    |
| `script.js`    | 6,917 B     |
| `privacy.html` | 6,964 B     |
| `images/`      | 26 files    |
| `reference/`   | 11 MB total |

Every local asset referenced by `index.html` and `styles.css` resolves. No file
downloaded empty.

## 2026-09-18 — Appearance baseline screenshots

Full-page screenshots of `reference/` served over a local static server, stored in
`reference/screenshots/`. They are the acceptance baseline for the whole migration.

| File          | Capture width | Full page height |
| ------------- | ------------- | ---------------- |
| `desktop.png` | 1265 px       | 8350 px          |
| `tablet.png`  | 753 px        | 9581 px          |
| `mobile.png`  | 360 px        | 11077 px         |

Notes on how these were captured, so that later comparisons are made the same way:

- The nominal target widths were 1280, 768 and 375 px. The captured widths are 15 px
  narrower because the browser reserves that width for a classic scrollbar. The
  stylesheet's only breakpoints are 680 px and 920/921 px, so each capture falls inside
  the same branch the nominal width would, and the baseline is valid.
- The page was scrolled from top to bottom before each capture. Thirty elements carry
  the `reveal` class and start at `opacity: 0` until an `IntersectionObserver` fires,
  and twenty-two images are lazily loaded. Without the scroll pass those sections
  photograph blank.
- The cookie banner was dismissed before capturing so that it does not overlay the
  page. Its own behaviour is verified separately.
- No horizontal overflow at the mobile width.

## 2026-09-20 — Image formats and layout shift

Cumulative Layout Shift on the home page, production build, measured with a
`PerformanceObserver` for `layout-shift` installed before the page rendered, then scrolled
end to end so every lazily loaded image arrived. Shifts caused by input are excluded.

| Width   | Before | After |
| ------- | ------ | ----- |
| 375 px  | 0      | 0     |
| 768 px  | 0      | 0     |
| 1280 px | 0      | 0     |

Zero shifts recorded in either state. All 26 images already emit intrinsic `width` and
`height` through static imports, which is why there was nothing to fix.

### Formats generated

`npm run images:formats` writes an AVIF and a WebP beside every JPEG and PNG in
`public/images/`. The originals are unchanged; a spot check of the served JPEG against
`reference/images/` is byte-identical.

|                             | Total          |
| --------------------------- | -------------- |
| 24 originals (JPEG and PNG) | 11,057 KB      |
| 24 WebP                     | 5,154 KB (47%) |
| 24 AVIF                     | 3,538 KB (32%) |

### What is not yet in effect, and why

`sizes` attributes were added to all five `next/image` call sites, measured against the
rendered widths: gallery tiles are `44vw` at two columns, `29vw` at three, and
`min(21vw, 251px)` at four, capped by the 1180 px container; the logos are fixed widths.

**None of this reaches the browser yet.** With `images.unoptimized` set, Next.js emits no
`srcset` and therefore omits `sizes` as well, and it serves the original JPEG regardless of
the AVIF and WebP beside it. The rendered `<img>` tags carry `width`, `height` and `src`
only. Today's download sizes are therefore unchanged from before this work.

The loader setting is deliberately left alone. It is settled with the hosting decision
(`docs/decisions/0005-hosting.md`), because which loader is right depends on where the site
runs. Once it is switched on, the `sizes` values and the generated formats take effect
without further change to the components.

## 2026-09-18 — Mobile experience audit

Every interactive element measured at 375 px, in a production build. "Hit area" is the
control's own box unioned with the transparent overlay that widens it. The threshold is
44 x 44 px.

| Control                    | Visible size | Hit area before | Hit area after        |
| -------------------------- | ------------ | --------------- | --------------------- |
| Burger toggle              | 40.0 x 32.0  | 40.0 x 32.0     | **44.0 x 44.0**       |
| Mobile menu link (5)       | 320.0 x 56.3 | 320.0 x 56.3    | 320.0 x 56.3          |
| Menu tab (6)               | 170.9 x 41.2 | 170.9 x 41.2    | **170.9 x 44.2**      |
| Order button (3)           | 320.0 x 53.9 | 320.0 x 53.9    | 320.0 x 53.9          |
| Story "Take a look inside" | 151.4 x 30.1 | 151.4 x 30.1    | **151.4 x 44.1**      |
| Gallery Instagram link     | 128.6 x 23.5 | 128.6 x 23.5    | **128.6 x 45.5**      |
| Visit "Get directions"     | 124.4 x 30.1 | 124.4 x 30.1    | **124.4 x 44.1**      |
| Visit telephone            | 127.1 x 21.5 | 127.1 x 21.5    | **127.1 x 50.1**      |
| Visit Instagram            | 127.4 x 21.5 | 127.4 x 21.5    | **127.4 x 50.1**      |
| "Show map"                 | 101.2 x 38.1 | 101.2 x 38.1    | **101.2 x 44.1**      |
| "Open in Google Maps"      | 195.7 x 22.8 | 195.7 x 22.8    | **195.7 x 44.8**      |
| Footer link (7, narrowest) | 39.0 x 26.1  | 31.8 x 26.1     | **53.0 x 44.1**       |
| Vegasoft credit            | 320.0 x 64.2 | 320.0 x 64.2    | 320.0 x 64.2          |
| Booking bar control        | 335.0 x 54.5 | did not exist   | **335.0 x 54.5**      |
| Cookie button (2)          | 162.7 x 38.1 | 155.2 x 38.1    | **162.7 x 44.1**      |
| Cookie policy link, inline | 151.7 x 19.0 | 151.7 x 19.0    | 151.7 x 19.0 — exempt |

Fifteen of the sixteen groups meet 44 x 44. The exception is deliberate: the "Privacy &
Cookie Policy" link sits inline in a sentence, where expanding it vertically would
overlap the lines above and below. WCAG 2.5.8 exempts links inline in running text for
exactly that reason.

Almost all of the increases are transparent overlays rather than padding, so the
controls look exactly as they did. The one visible change is in the "Get in touch"
block, where the telephone and Instagram lines sit only 7.9 px apart and had to be
spaced out: that block grew by 48 px, and every other section measures the same as
before at both 375 px and 1280 px.

**There is no horizontal scrolling at 375 px.** The document scroll width and the client
width are both 375.

### Other findings from the audit

- **Scroll behind the open menu.** Holding the page works: the scroll position does not
  move while the menu is open (1009 before and after a wheel gesture), it is restored on
  close (700 to 1009 to 700), and nothing shifts sideways — the brand mark stays at
  x 20 throughout. The section behind the menu stays at the same offset the whole time.
- **Focus.** All 30 focusable elements show a visible focus ring when reached with the
  keyboard. None was missing one.
- **Stuck hover.** Tested in a touch-emulating browser reporting `hover: none` and
  `pointer: coarse`. After tapping a menu tab, an order button and a footer link and
  then tapping elsewhere, each returned to exactly the computed style of a sibling that
  had never been touched. No hover state persists, so no change was needed.

## 2026-09-18 — Accepted difference: `.link-arrow` is 1.8 px wider

The "Take a look inside →" link in the story section measures 158.1 px on the
production site and 159.9 px on the migrated site, at 1280 px. This is a deliberate
decision, not a regression, and a future comparison must not read it as one.

The cause is the arrow. `→` (U+2192) is not in the `latin` subset of Hanken Grotesk,
so **both** versions fall back to another font for that single character. They fall back
differently: the production stack goes straight to `system-ui`, while `next/font` inserts
a metrics-matched `Hanken Grotesk Fallback` family ahead of it, and that family's arrow
is fractionally wider.

Removing the synthetic fallback would recover the 1.8 px exactly. It was kept, because
the fallback is what stops text reflowing when the webfont swaps in, and layout shift is
a stated requirement while 1.8 px on one inline link is not perceptible.

It is the only element on the page affected. The three decorative feature marks are fixed
at 40 px by the stylesheet, and the hero's italic span matches to within 0.01 px.

## Finding: a script injected by the content delivery network

`index.html` and `privacy.html` each end with a bot-detection script that Cloudflare
injects at the edge. It is not part of the hand-written source, and it requests
`/cdn-cgi/challenge-platform/scripts/jsd/main.js`, which returns 404 when `reference/`
is served locally. That 404 is the only console error the reference copy produces.

The script is preserved in `reference/` because that directory must stay byte-exact. It
must not be carried into the migrated application: it is a third-party script that runs
before any consent is given.

### Effect on the request count

The client's measured figure of 19 HTTP requests probably does not include this script.
It is injected at the edge rather than written into the source, and it pulls in a further
request of its own for `/cdn-cgi/challenge-platform/scripts/jsd/main.js`.

Any deployment behind Cloudflare will have the script injected again, whether or not the
application asks for it. Our own measurements will therefore show requests the client's
original figure never counted. A comparison that ignores this will read as a regression
we introduced, when nothing in the application changed. Always state whether a recorded
measurement was taken behind Cloudflare, and compare like with like.

### Effect on file comparison

It also carries a token that changes on every request, so a freshly downloaded
`index.html` never hashes the same as the stored copy. Comparing the two with that one
line excluded gives an identical hash, which confirms the recovered copy is faithful to
the hand-written source. `styles.css` and `script.js` hash identically without any
exclusion.

## 2026-09-20 — Live rating, first observation

The header badge reads from the Places API (New) using the café's Place ID
`ChIJRxz9-QClbUgRigJpc1wN0pc`, which resolves to "Zukis Caffetteria, 3B Queen St,
Exeter EX4 3SB". The figure is fetched on the server once per build or daily
revalidation, never per visitor and never from the browser.

| Date       | Source                     | Rating | Reviews | Note                                |
| ---------- | -------------------------- | ------ | ------- | ----------------------------------- |
| 2026-09-18 | client's analysis document | 4.6    | 281     | reported, not measured here         |
| 2026-09-20 | Places API (New), observed | 4.6    | 281     | first measurement from this project |

The two agree today. They will drift; this table is where later observations go, so a
later figure is compared with a dated one rather than with memory.

### How the figure was verified

- Key present: the badge renders "4.6 · 281 reviews · Google, 20 Sept 2026"; the key
  value appears 0 times in the prerendered HTML, in `.next/static`, in `.next/server`
  and in the served pages; 0 client chunks name the provider host; the browser makes 0
  requests to the provider at 375, 768 and 1280 pixels.
- Once per build: with a stand-in provider and a clean `.next`, 20 page requests produced
  1 provider request, with the key sent as a header and never in the URL.
- Key withheld: 0 badge markup, the page still answers 200, the header lays out with the
  Instagram link 24px after the logo at all three widths, height 69.4px, no horizontal
  scroll. Screenshots: `docs/screenshots/rating-live-*.png` and `rating-absent-*.png`.

### Two cautions for anyone re-measuring

- **Start from a clean `.next`.** The persistent build cache will replay an earlier
  prerender of the home page without running the fetch again, so a build after changing
  the key or the fetcher can "succeed" in a fraction of a second and show a stale result.
  Remove `.next` first.
- **Never publish or share `.next`.** Its `cache/fetch-cache` directory stores the
  provider request and response. With the key sent as a header it does not contain the
  key (checked: 0 occurrences after a clean build), but an earlier draft that put the key
  in the query string did leave it there, because the cache is keyed on the URL. Keep the
  key in a header and `.next` ignored, as both are now.

## 2026-09-21 — Search positions before the keyword plan

The client's analysis of 2026-09-18 reports the site's position for the two local search
terms it asks the page to target. These are the starting figures; the effect of the
keyword changes applied on 2026-09-21 is measured against them, not against memory.

| Term                       | Position, as reported 2026-09-18 |
| -------------------------- | -------------------------------- |
| "cafe Exeter Queen Street" | tenth                            |
| "breakfast Exeter"         | eleventh                         |

The positions were reported by the client and could not be re-measured from this
environment. The first measurement after deployment belongs in this table with its date.
The on-page changes were: the title and meta description, one word in the story heading,
the menu heading, one phrase in the visit hint, and one image description. No hidden
text, no repeated phrases, no second `<h1>`; the hero and visit headings are unchanged.

## 2026-09-21 — Image delivery switched on

`images.unoptimized` is off. Every `next/image` now goes through a loader that asks for
one of the generated widths (128, 256, 384, 512 or 768 px), and the `/img` route serves
that width in AVIF, WebP or the original format according to the browser's `Accept`
header. Measured on a production build served locally (`next start`), the page scrolled
end to end so every lazily loaded image arrived. **These are local figures; the same
measurement is to be repeated on the deployed address and recorded beneath.**

The 642,795-byte `logo.png` that the page also requests as its `apple-touch-icon` and
fallback favicon is excluded from every row below: it is not a `next/image`, it is
unchanged by this work, and it is noted separately at the end.

| Browser and screen            | Before       | After       | Reduction | Widths served     |
| ----------------------------- | ------------ | ----------- | --------- | ----------------- |
| Accepts AVIF, 375 px, 1x      | 11,318,031 B | 332,876 B   | 97.1%     | 256 (25), 128 (1) |
| Accepts AVIF, 375 px, 2x      | 11,318,031 B | 639,695 B   | 94.3%     | 384 (25), 128 (1) |
| Accepts AVIF, 1280 px, 1x     | 11,318,031 B | 332,876 B   | 97.1%     | 256 (25), 128 (1) |
| Accepts AVIF, 1280 px, 2x     | 11,318,031 B | 1,002,689 B | 91.1%     | 512 (25), 128 (1) |
| Accepts WebP only, 375 px, 2x | 11,318,031 B | 968,602 B   | 91.4%     | 384, 256, 128     |
| Accepts neither, 375 px, 2x   | 11,318,031 B | 1,032,089 B | 90.9%     | 384, 256, 128     |

Before, the 25 images were the same 25 files at every width and density: 24 JPEGs and
the logo PNG at their full size, 11.3 MB. The `sizes` attributes were already in place
but had no effect without a `srcset`.

Format actually served, checked on the route directly with three `Accept` headers for
the same 384-pixel gallery tile:

| `Accept`                    | Response                   |
| --------------------------- | -------------------------- |
| `image/avif,image/webp,*/*` | `200 image/avif`, 22,233 B |
| `image/webp,*/*`            | `200 image/webp`, 33,618 B |
| `image/jpeg,*/*`            | `200 image/jpeg`, 35,664 B |

Every response carries `Vary: Accept` and `Cache-Control: public, max-age=31536000,
immutable`; the address carries the file's content hash, so a changed file gets a new
address. A width larger than a source (the 300-pixel Vegasoft mark at 768) falls back to
the original-size file in the negotiated format. A name that is not one of ours, or a
width that is not generated, is a `404`.

Cumulative layout shift, measured as on 2026-09-20:

| Width   | Before | After |
| ------- | ------ | ----- |
| 375 px  | 0      | 0     |
| 768 px  | 0      | 0     |
| 1280 px | 0      | 0     |

### Generated files

`npm run images:formats` now also writes the resized copies: 351 new files, 16.1 MB,
beside the 48 full-size AVIF and WebP files from 2026-09-20. It skips anything already
current, so a rerun after adding one photograph writes only that photograph's copies.

### Noted, not changed here

The page links `/images/logo.png` (642,795 B) as its fallback icon and Apple touch icon,
so browsers that fetch those still download the full-size PNG once per visit. It is the
largest single image request left on the page and is a separate change.

## 2026-09-21 — Icons

The page offered the 642,795-byte `logo.png` as its alternate icon and as its Apple touch
icon, so browsers that use those links fetched it on every cold load — the largest single
image request left after image delivery was switched on. The icons are now drawn from
`favicon.svg`: `icon-16.png`, `icon-32.png`, `icon-48.png` for browsers that do not use
SVG icons, and `apple-touch-icon.png` at 180 × 180 on the theme colour. `favicon.svg`
stays the primary icon and `logo.png` stays where it is used as an image in the page.

Icon bytes fetched on a cold load at 375 px, production build served locally, read from a
request log in front of the server:

| Browser                               | Before                                                       | After                                                                                       |
| ------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Chrome 153 (uses the SVG)             | `logo.png` 642,795 B                                         | `favicon.svg` 652 B                                                                         |
| Safari 26 (does not use the SVG icon) | `favicon.svg` 652 B + `logo.png` 642,795 B × 2 = 1,286,242 B | `icon-48.png` 1,560 + `icon-32.png` 1,121 + `icon-16.png` 646 + `favicon.svg` 652 = 3,979 B |

Chrome had been choosing the PNG over the SVG when the PNG carried no `sizes`; with sized
small PNGs offered it takes the SVG alone. Safari fetched the logo twice, once for each
link that pointed at it. Neither browser fetched the touch icon on an ordinary page load
in this test; it is 5,084 B when it is fetched.

## 2026-09-21 — First deployment: https://zuki-web.vegasoft.workers.dev

The site is deployed to Cloudflare Workers in the Vegasoft account, at the address above,
by the Deploy workflow from `main` (Worker version `5de0c575…`). The custom domain is not
yet connected (`docs/decisions/0005-hosting.md`). Every figure in this section was measured
**from a GitHub Actions runner** by the `Verify deployment` workflow, because `workers.dev`
is not reachable from the workstation used today. The runner reached Cloudflare's Seattle
location, so the timings are transatlantic; a visitor in Exeter is served from a closer
location and should see less.

### Item 2 — the deployment

| Check                         | Result                                                                                                                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home page                     | `200`, 185,534 B of HTML in 0.61 s from the runner; `server: cloudflare`, `x-opennext: 1`                                                                              |
| Sections at 375, 768, 1280    | all eight present; no horizontal scroll at any width                                                                                                                   |
| Rating badge                  | `Rated 4.6 out of 5 from 281 reviews on Google, updated 21 Sept 2026. Read the reviews.`                                                                               |
| `/privacy.html`               | `308` → `/privacy`; `/privacy` `200`; `/privacy/` `308` → `/privacy`                                                                                                   |
| `/sitemap.xml`, `/robots.txt` | `200 application/xml`, `200 text/plain`, both naming `zukiscaffetteria.co.uk`                                                                                          |
| Cookie banner                 | shown on a first visit at all three widths                                                                                                                             |
| Requests before consent       | one host only, the site itself; 0 cookies; 0 iframes                                                                                                                   |
| Console                       | 0 errors, 0 warnings, 0 page errors, at all three widths                                                                                                               |
| Places key in served assets   | the two pages and every script and stylesheet they reference: 0 of 11 contain it                                                                                       |
| Incremental cache             | first and second request both `x-nextjs-cache: HIT`, `cache-control: s-maxage=86377, stale-while-revalidate=2592000`; the deploy populated 6 objects into the KV cache |
| Static build output           | `cf-cache-status: HIT`, `cache-control: public,max-age=31536000,immutable`                                                                                             |
| Injected bot-detection script | **absent** on this address (0 `cdn-cgi/challenge-platform` tags). It is a zone setting, so it may return when the custom domain in the other account is connected      |

### Item 4 — bookings against the live database

Test rows were written to the live database for these checks and deleted afterwards
(0 rows before, 0 after).

1. `POST` → `201`, `bk-mub1mskc-1nl1kd`; the row is in D1; availability for the slot shows `remaining: 10`. The Worker was redeployed between the local runs and this one and the database is separate from the Worker, so a redeploy cannot lose a booking.
2. 12 of 12 covers → `409 That time has just filled up — please choose another.`, `remaining: 0`; 2 seats left, party of 3 → `409 Only 2 seats are left at that time…`, `remaining: 2`.
3. 11 of 12 booked, two simultaneous requests for the last cover: `409` and `201`; the database holds 3 rows, 12 covers.
4. Outside hours → `time`; inside the minimum notice → `time`; beyond the window → `date`; party of 7 → `partySize`; each alone.
5. The rate limit did not trigger on the first deployment (issue #66): the in-memory limiter was per isolate. Fixed the same day; see the entry below.
6. The suite passes unchanged (76 tests).

### Item 8 — the checks that needed a public address

- **Schema.org validator**, on the deployed page: rendered, 1 object, type `CafeOrCoffeeShop`, **0 errors, 0 warnings**.
- **Google Rich Results test**, run by the repository owner while signed in, on 2026-09-21 at 12:47:38: **2 valid items detected**, eligible for rich results — Local business, 1 valid item; Organisation, 1 valid item — page crawled successfully, 0 errors. An unauthenticated run from the workflow is refused with "Log in and try again", so this test stays a manual step.
- **Load time and request count**, runner in Seattle, Cloudflare `SEA`, fresh browser, no cache:

  | Width   | Time to first byte | DOM content loaded | `load` event | Requests at `load` | Requests after scrolling the whole page |
  | ------- | ------------------ | ------------------ | ------------ | ------------------ | --------------------------------------- |
  | 375 px  | 90 ms              | 187 ms             | 586 ms       | 18                 | 19                                      |
  | 1280 px | 66 ms              | 124 ms             | 567 ms       | 18                 | 35                                      |

  Against the client's original 0.532 s download, 0.198 s page load and 19 requests: the requirement of under two seconds is met with room; the request count at `load` matches the original 19 within one, and grows only as the visitor scrolls and lazily loaded photographs arrive. These are measured behind Cloudflare; the injected script that `docs/baseline.md` warns about was not present on this address, so nothing needed subtracting.

- **Canonical URL.** The Worker serves the root at `/`. The canonical Next emits is `https://zukiscaffetteria.co.uk` without the slash, and it strips the slash even when the value is given as a URL object with one; the original site's canonical was `https://zukiscaffetteria.co.uk/`, and the sitemap and the structured data still say `/`. The two forms are the same resource: an empty path and `/` are equivalent for the root under RFC 3986 §6.2.3, and search engines normalise them identically. Neither end is wrong, so neither was changed; for `/privacy` the canonical, the served path and the sitemap agree exactly.

### Item 3 — image delivery, measured on the deployed site

Fresh browser on the runner, the page scrolled end to end and every image waited for
(26 of 26 complete), 375 px at 2x, 768 and 1280 px at 1x. The local figures of the same
day are alongside; they agree to within the size of one photograph's variant.

| Screen      | Deployed bytes | Local bytes | Format served | Widths chosen              | Layout shift |
| ----------- | -------------- | ----------- | ------------- | -------------------------- | ------------ |
| 375 px, 2x  | 644,175 B      | 639,695 B   | AVIF          | 384 (23), 256 (1), 128 (2) | 0            |
| 768 px, 1x  | 332,876 B      | 332,876 B   | AVIF          | 256 (23), 128 (3)          | 0            |
| 1280 px, 1x | 332,876 B      | 332,876 B   | AVIF          | 256 (23), 128 (3)          | 0            |

Before this work the same page sent 11,318,031 B of images at every width. The image route
on the deployed Worker answers the same 384 px tile as `image/avif` 22,233 B, `image/webp`
33,618 B or `image/jpeg` 35,664 B according to `Accept`, with `Vary: Accept` and a year's
immutable caching. Whole-page totals after scrolling, including HTML, script, fonts and
images: 1,646,938 B at 375 px (43 requests), 1,335,639 B at 768 and 1280 px (42 requests).

## 2026-09-21 — Rate limit counted in D1, verified on the deployed site

Issue #66 fixed: the limit is counted in a D1 table by one guarded `INSERT`, and the
caller's address is read only from `CF-Connecting-IP`, which the edge sets. Verified by
the `Verify deployment` workflow (run 35591430333, Worker version `d647696c`), with each
part on its own runner and therefore its own address; the test rows and the addresses
were removed at the end (0 bookings, 0 `rate_limit_hits` after clean-up).

| Check                                        | Result                                                                                       |
| -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Five invalid posts from one address          | `400 400 400 400 400`                                                                        |
| Sixth                                        | `HTTP/2 429`, `retry-after: 600`                                                             |
| Seventh, with a forged `x-forwarded-for`     | `HTTP/2 429`, `retry-after: 600` — the header is ignored                                     |
| Eighth, with a forged `cf-connecting-ip`     | `HTTP/2 403` — the edge refuses it before the Worker sees it                                 |
| The table during the test                    | one row per accepted request, keyed on the runners' real addresses; the limited address at 5 |
| A second address while the first was limited | `400` for its empty name, not `429`                                                          |
| After the ten-minute window                  | the same address's next post is `400` again, not `429`                                       |

The other booking checks were repeated on the same run: a booking persists and shows in
availability; 12 of 12 covers refuse a party of 1 (`remaining: 0`); 10 of 12 refuse a
party of 3 with `Only 2 seats are left…` (`remaining: 2`); two simultaneous requests for
the last cover give `201` and `409` with exactly 12 covers stored; the four field-level
rejections each land on their own field.

## 2026-09-21 — Booking notices by email, verified on the deployed site

Notices go out through Resend to an internal address until go-live
(`docs/decisions/0007`). Verified by the `Verify deployment` workflow's `persist` part
with the Worker's log streamed on the runner; the sending key is send-only, so Resend's
API cannot list messages, and arrival, Reply-To, spam placement and the field list are
confirmed from the mailbox.

| Check                                   | Result                                                                                                                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Booking with the correct key            | `201`, row `bk-mub8dmk2-prrz5z` in D1; Worker log `notification sent … message 01a0c3f9-2966-751f-a1ef-da621d4ddeab`                                                         |
| Booking with the key deliberately wrong | `201`, row `bk-mub85iar-8gwyl2` in D1, visitor answered `{"ok":true …}`; Worker log `notification failed for bk-mub85iar-8gwyl2 (2026-09-25 12:00): provider answered 401 …` |
| Key restored, booking again             | `201`, notice sent                                                                                                                                                           |
| Clean-up                                | after every run: 0 bookings, 0 `rate_limit_hits`                                                                                                                             |

A failed notice is found by searching the Worker's logs (observability is on) for
`notification failed`; the line carries the booking reference, and the row is in D1.
