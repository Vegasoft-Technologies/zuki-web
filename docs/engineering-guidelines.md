# Engineering guidelines

These are the working standards for this repository. Read them before your first pull
request. They exist so that anyone joining the project can read the code and understand
why it is shaped the way it is.

## Language

All repository content is written in English: code, identifiers, comments, commit
messages, documentation, issues and pull requests. The website itself is in English
because its audience is in Exeter, United Kingdom.

## Branches and commits

- Never push directly to `main`. Every change arrives through a pull request.
- Branch names: `feat/<short-slug>`, `fix/<short-slug>`, `chore/<short-slug>`,
  `docs/<short-slug>`.
- Commit messages follow Conventional Commits:
  `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`, `test:`, `perf:`, `build:`, `ci:`.
- The subject line is imperative, at most 72 characters, with no trailing period.

  Good: `feat(menu): sort items by ascending price`
  Bad: `Updated the menu sorting and some other fixes`

- One logical change per commit. If the subject line needs an "and", split the commit.
- A commit carries exactly one author. Do not append trailers or footers to commit bodies.

## Scope discipline

- Change only what the task requires. Do not reformat, rename or restructure adjacent code.
- Do not introduce an abstraction for something used in one place.
- New dependencies require a stated reason and agreement in the pull request. Every
  dependency adds weight to a site whose measured performance is a client requirement.
- If you notice an unrelated problem, open an issue for it. Do not fix it in the same
  pull request.

## The reference directory

`reference/` holds a byte-exact copy of the website as it was downloaded from production,
together with screenshots at three widths. It is the source of truth for appearance and
is never edited.

Until the migration is complete, the rendered site must be visually identical to
`reference/screenshots/`. Changes to appearance or content are separate, later tasks.

## Styling

`src/app/globals.css` is the original production stylesheet. It was moved into the
project, not rewritten.

The stylesheet is fluid rather than breakpoint-driven: 212 of its 228 rules sit outside
any media query and adapt through `clamp()`, which scales a value smoothly between a
minimum and a maximum instead of jumping at a threshold. Only sixteen rules live in media
queries, at 920px and 680px, and they handle the two things that cannot be fluid — the
navigation swap and the number of grid columns. Do not restructure this, and do not
convert it to a mobile-first authoring order: the rewrite changes roughly thirty rules,
alters nothing a visitor can perceive, and discards the node-by-node verification against
`reference/`.

New CSS written for features added after the migration is authored mobile-first: style the
narrow layout first, then widen it with `min-width` queries. Reuse the existing thresholds
of 681px and 921px rather than introducing new ones, and prefer `clamp()` over a
breakpoint whenever a value can vary smoothly.

- Do not convert it to CSS Modules, Tailwind or any CSS-in-JS library.
- Do not reorder, reformat or tidy its rules.
- Do not rename a CSS class. Class names such as `menu__tab`, `mi__price` and
  `hero__canopy` are the contract between the markup and the stylesheet.
- Colours, spacing and fonts come from the custom properties defined on `:root`. Use
  those variables rather than writing literal values.

## Components

- App Router with TypeScript in strict mode.
- Components are Server Components by default. Add `"use client"` only where state,
  effects, browser APIs or event handlers are genuinely needed, and keep that component
  as small as possible.
- One component per file; the file name matches the exported component name.
- Props are explicitly typed. `any` is not permitted.
- Layout components live in `src/components/layout/`, page sections in
  `src/components/sections/`, reusable primitives in `src/components/ui/`.

## Content and data

Content never lives inside JSX. Adding a menu item, changing a price or updating the
opening hours must require editing only a file in `src/data/`.

- `src/data/site.ts` is the single source of truth for the business name, address,
  telephone number, coordinates and social links. Anything appearing in more than one
  place is defined here and imported.
- `src/data/menu.ts` holds all six menu categories. Prices are numbers, not strings, so
  they can be sorted and formatted consistently.
- Structured data for search engines is generated from these same files, so the markup
  can never drift from what the page displays.

See `docs/content-guide.md` for how to make content changes without touching components.

## Rendering safety

Any value that differs between the server render and the browser causes a hydration
mismatch. Two such values exist in this project:

- **The current time**, used by the opening-status line. Render a neutral placeholder
  during the server render and compute the real value in an effect.
- **`localStorage`**, used by the cookie banner. It does not exist on the server. Read it
  in an effect only.

Never silence a hydration warning to make it disappear. Fix the cause.

## Images

- Use `next/image` with static imports so width and height are always emitted. Missing
  dimensions cause layout shift, which the performance targets forbid.
- Images in the header and hero are marked `priority`. Everything else stays lazy.
- Original files keep their names in `public/images/`.

## Accessibility

The site that this project replaces is accessible, and that must not regress.

- Preserve `role`, `aria-selected`, `aria-expanded`, `aria-label`, `aria-live` and
  `aria-hidden` attributes when porting markup.
- Preserve the `prefers-reduced-motion` handling; animation is opt-out for the visitor.
- Interactive elements are `<button>` or `<a>`, never a `<div>` with a click handler.
- Every image has meaningful alternative text, or `alt=""` when purely decorative.
- Interactive elements measure at least 44 by 44 pixels on touch screens.
- Every change is checked at 375px before any other width. There is never horizontal
  scrolling at that width.

## Privacy

No analytics, tracking script or third-party embed may load before the visitor has given
explicit consent, in line with UK GDPR and Information Commissioner's Office guidance.
The Google Maps embed loads only after the visitor clicks to load it.

## Definition of done

Before requesting a review, run these and confirm they pass:

    npm run lint
    npx tsc --noEmit
    npm run build

Then check the running site at 375px, 768px and 1280px:

1. Every section renders and matches `reference/screenshots/`.
2. All six menu tabs switch correctly.
3. The mobile menu opens and closes.
4. The map loads only after the button is clicked.
5. The cookie banner appears on a first visit and not on the second.
6. The opening status matches the real time in London.
7. The console shows no errors and no hydration warnings.
8. There is no horizontal scrolling at 375px.

Attach screenshots at the three widths to the pull request.

## Performance targets

These come from the client's measured baseline and are treated as requirements:

- Page load under 2 seconds.
- Keep the number of HTTP requests low; the previous implementation used 19.
- Structured data validates with zero errors.

Record measurements in `docs/baseline.md` with the date they were taken.
