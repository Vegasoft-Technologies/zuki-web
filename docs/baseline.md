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

## Finding: a script injected by the content delivery network

`index.html` and `privacy.html` each end with a bot-detection script that Cloudflare
injects at the edge. It is not part of the hand-written source, and it requests
`/cdn-cgi/challenge-platform/scripts/jsd/main.js`, which returns 404 when `reference/`
is served locally. That 404 is the only console error the reference copy produces.

The script is preserved in `reference/` because that directory must stay byte-exact. It
must not be carried into the migrated application: it is a third-party script that runs
before any consent is given.
