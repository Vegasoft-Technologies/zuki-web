# Contributing

Read [`docs/engineering-guidelines.md`](docs/engineering-guidelines.md) first. It
describes how the code is shaped and why. This file describes how a change gets from
your machine into `main`.

## Getting set up

Node 24 — the version is in `.nvmrc`, so `nvm use` picks it up.

```bash
npm install
npm run dev
```

## Branches

`main` is protected. Pushing to it directly is rejected by the server, including for
administrators. Every change arrives through a pull request.

Branch names say what kind of change they are:

```
feat/<short-slug>      a new capability
fix/<short-slug>       a defect
chore/<short-slug>     tooling, configuration, housekeeping
docs/<short-slug>      documentation
refactor/<short-slug>  a change with no effect a visitor can see
```

## Commits

Conventional Commits: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`,
`test:`, `perf:`, `build:`, `ci:`. A scope is welcome where it helps —
`feat(menu): sort items by ascending price`.

- The subject is imperative, at most 72 characters, no trailing full stop.
- One logical change per commit. If the subject needs an "and", split it.
- A commit has one author and no trailers. Nothing is appended after the body.

## Before you ask for a review

Run these four, in this order:

```bash
npm run lint
npm run build
npx tsc --noEmit
npm run format:check
```

**The order matters.** `npx tsc --noEmit` needs the route types that `npm run build`
generates. On a clean checkout it fails if it runs first, and the failure looks like a
missing global type rather than a missing build.

Then run the tests:

```bash
npm test
```

Then open the site and check it at 375px, 768px and 1280px:

1. Every section renders and matches `reference/screenshots/`.
2. All six menu tabs switch, by click and by left and right arrow keys.
3. The mobile menu opens, closes, and holds the page still behind it.
4. The map loads only after "Show map" is pressed.
5. The cookie banner appears on a first visit and not on a second.
6. The opening status matches the real time in London and the footer year is right.
7. No console errors and no hydration warnings.
8. No horizontal scrolling at 375px, and no interactive element smaller than 44 by 44.
9. Every interactive element is reachable by keyboard and shows a focus ring.

Attach screenshots at the three widths. The pull request template has a place for them.

## Merging

CI runs `npm ci`, `npm run lint`, `npm run build` and `npx tsc --noEmit` on every pull
request, and the `build` check has to pass before `main` will accept the merge.

**Wait for a check to register before you merge.** `gh pr checks` prints
`no checks reported` in the gap between pushing and GitHub creating the run. That is a
race, not a pass. Confirm a check exists and has completed:

```bash
gh api repos/Vegasoft-Technologies/zuki-web/commits/$(gh pr view <n> --json headRefOid --jq .headRefOid)/check-runs
```

After merging, confirm the change is actually on `main` before branching again. A pull
request that passed its checks but was never merged looks identical to a merged one in
every list that shows only the check status.

## Things that will be sent back

- A change to `src/app/globals.css` without a reason in the description. It is the
  production stylesheet, moved rather than rewritten, and it is the yardstick the
  migration is measured against.
- A renamed CSS class. The names are the contract between the markup and the stylesheet.
- Content written into a component instead of `src/data/`.
- A new dependency without a stated reason.
- `suppressHydrationWarning`. Fix the cause instead.
- Anything naming the tools used to write the code. The repository is public.
