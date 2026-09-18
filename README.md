# Zuki's Caffetteria

Website for Zuki's Caffetteria, an Italian and Turkish cafe at 3B Queen Street, Exeter
EX4 3SB, United Kingdom. Live at <https://zukiscaffetteria.co.uk>.

The site is being migrated from hand-written HTML, CSS and vanilla JavaScript to
Next.js, so that a booking API and a review-fetching API can be added to it.

## Repository layout

| Path         | Contents                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------- |
| `src/`       | The Next.js application. App Router, TypeScript.                                            |
| `reference/` | A byte-exact copy of the production site. The source of truth for appearance. Never edited. |
| `docs/`      | Engineering documentation and recorded measurements.                                        |
| `public/`    | Static assets served at the site root.                                                      |

`reference/screenshots/` holds full-page captures of the production site at desktop,
tablet and mobile widths. They are the acceptance baseline for the migration: the
rendered output must match them.

## Requirements

Node.js 20 or newer, and npm.

## Getting started

```bash
npm install
npm run dev
```

The development server runs at <http://localhost:3000>.

## Commands

| Command                | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the development server.             |
| `npm run build`        | Produce a production build.               |
| `npm run start`        | Serve a production build.                 |
| `npm run lint`         | Run ESLint.                               |
| `npm run format`       | Format the project with Prettier.         |
| `npm run format:check` | Check formatting without writing changes. |
| `npx tsc --noEmit`     | Type-check. See the order below.          |

## Verification

Run these three in this order before requesting a review:

```bash
npm run lint
npm run build
npx tsc --noEmit
```

The order matters. `npx tsc --noEmit` needs the route types that `npm run build`
generates, so on a clean checkout it fails if it is run first.

## Performance budget

The figures the migrated site must not regress against are recorded in
[`docs/baseline.md`](docs/baseline.md), together with the date each was measured.
