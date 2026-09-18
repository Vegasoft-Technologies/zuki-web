# Architecture

A single-page marketing site for a cafe, plus a privacy page. Next.js App Router,
TypeScript, no UI framework and no CSS framework.

## The folder tree

```
src/
├── app/                     routes, and everything the framework owns
│   ├── layout.tsx           html and body, fonts, global CSS, JSON-LD, header, footer
│   ├── page.tsx             the home page: composes the section components
│   ├── privacy/page.tsx     the privacy and cookie policy
│   ├── sitemap.ts           generates /sitemap.xml
│   └── globals.css          the production stylesheet, moved and never edited in place
├── components/
│   ├── layout/              things present on every page: header, footer, menus, the booking bar
│   ├── sections/            the bands of the home page, top to bottom
│   └── ui/                  small pieces reused across sections
├── data/                    all content: menu, gallery, opening hours, business details
├── lib/                     logic with no React in it
└── types/                   shared type definitions
```

`reference/` sits outside `src/` and holds a byte-exact copy of the production site with
screenshots at three widths. It is the yardstick for appearance and is never edited.

`public/images/` holds the original image files under their original names.

## How a request renders

1. The request reaches a route in `src/app/`. Both routes are statically prerendered at
   build time, so there is no work per request.
2. `layout.tsx` renders `<html>` and `<body>`, loads the two typefaces through
   `next/font` (self-hosted, so nothing is fetched from Google), imports the stylesheet,
   emits the JSON-LD, and places the header, the footer, the booking bar and the cookie
   banner around the page.
3. `page.tsx` renders the six sections in order: hero, story, menu, gallery, order,
   visit. Each reads what it needs from `src/data/`.
4. The HTML that arrives is complete and readable with JavaScript switched off, except
   for three values that depend on the clock or on stored state — see below.
5. React hydrates. The nine client components attach their behaviour, the three deferred
   values fill in, and sections fade in as they scroll into view.

## Which components run in the browser, and why

Everything is a server component unless it needs the browser. Nine do:

| Component              | Why                                                                                                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `layout/SiteHeader`    | Holds the open state of the mobile menu. The burger button is the last child of `<header>` and the menu is the header's next sibling, so the header is the smallest boundary that can contain both. |
| `layout/MobileMenu`    | Holds the page still while it is open and puts the scroll position back on close.                                                                                                                   |
| `sections/MenuTabs`    | Holds which tab is selected, and handles arrow-key navigation.                                                                                                                                      |
| `ui/Reveal`            | Runs the `IntersectionObserver` that fades a section in. Reveals immediately when the visitor has asked for less motion.                                                                            |
| `ui/OpeningStatus`     | The clock.                                                                                                                                                                                          |
| `ui/OpeningHoursTable` | The clock, again: which row is today.                                                                                                                                                               |
| `ui/CurrentYear`       | The clock, again: the footer copyright year.                                                                                                                                                        |
| `ui/CookieBanner`      | Reads and writes the stored consent choice.                                                                                                                                                         |
| `ui/LazyMap`           | Holds whether the map has been asked for, and reads the stored consent.                                                                                                                             |

`MenuTabs` is worth a note. Marking `MenuSection` as a client component would have
pulled `menu.ts` — 27 KB of data — plus three more components into the browser bundle,
for the sake of one string of state. Instead the panels are rendered on the server and
passed to `MenuTabs` as a prop, and `MenuTabs` owns only the tab strip and the wrapper
element that carries the active class. The measured cost of making the tabs interactive
was 926 bytes.

## Three values that cannot be rendered on the server

Anything that differs between the server render and the browser causes a hydration
mismatch. Three such values exist:

- **The opening status.** The server has no idea what time it is where the visitor is.
- **Today's row in the opening hours table.** Same reason.
- **The footer copyright year.** The page is built once and served for months; a year
  written at build time goes stale every January.

And one more that is not about the clock:

- **The stored cookie choice.** `localStorage` does not exist on the server.

The first three ship as empty elements and fill after mount. The fourth is read through
`useSyncExternalStore`, which is built for this: the server is told nothing is known,
the browser reads the real value after hydration, and React reconciles once without
warning. Reading `localStorage` can throw outright in private browsing, so both reads
and writes are wrapped and a failure is treated as "no choice recorded".

A hydration warning is never suppressed. If one appears, the cause is fixed.

## Privacy

Nothing third-party loads before the visitor allows it. The map is a Google embed and is
not requested until either the visitor presses "Show map" or a stored choice of "accept
all" is found. This is measurable: with a fresh browser profile, no request reaches
google, gstatic or maps until one of those two things happens.

The typefaces are self-hosted for the same reason, and because it removes a
render-blocking request to a third party.

## Testing

`src/lib/openingStatus.ts` holds no React and takes the time as an argument, which is
what makes it testable. Its tests run under Node's built-in test runner — `npm test` —
with no test framework, no transform and no configuration, because Node 24 runs
TypeScript directly.
