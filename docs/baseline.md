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
