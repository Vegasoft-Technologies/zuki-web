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
