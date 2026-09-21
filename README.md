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

Bookings are stored in a Cloudflare D1 database, simulated locally by `npm run dev`. Run
`npm run db:migrate:local` once, and again whenever a file is added to `migrations/`, so
the local database has the schema.

## Commands

| Command                    | Purpose                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| `npm run dev`              | Start the development server.                                                                 |
| `npm run build`            | Produce a production build.                                                                   |
| `npm run start`            | Serve a production build.                                                                     |
| `npm run lint`             | Run ESLint.                                                                                   |
| `npm run format`           | Format the project with Prettier.                                                             |
| `npm run format:check`     | Check formatting without writing changes.                                                     |
| `npx tsc --noEmit`         | Type-check. See the order below.                                                              |
| `npm run preview`          | Build the Cloudflare Worker and run it locally, with the cache, queue and database simulated. |
| `npm run db:migrate:local` | Apply the SQL files in `migrations/` to the local database.                                   |

## Verification

Run these three in this order before requesting a review:

```bash
npm run lint
npm run build
npx tsc --noEmit
```

The order matters. `npx tsc --noEmit` needs the route types that `npm run build`
generates, so on a clean checkout it fails if it is run first.

## Deployment

The site runs on Cloudflare Workers, built by `@opennextjs/cloudflare` from the Next.js
output (`docs/decisions/0005-hosting.md`). The Worker is configured in `wrangler.jsonc`
and the adapter in `open-next.config.ts`.

Deployment is done by the `Deploy` workflow only: a push to `main` deploys the Worker,
and every pull request uploads a preview version whose address appears in the job
summary. The workflow needs the repository secrets `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID` and `GOOGLE_PLACES_API_KEY`; until they exist it stops early and
says so. Who holds those credentials, and where they live, is recorded in
`docs/access.md`.

Do not deploy from a workstation. The adapter copies `.env.local` into the Worker
bundle, following Next's environment-file rules, so a bundle built beside a real
`.env.local` would carry the key inside the script. The workflow builds on a runner
that has no such file, and the Worker reads the key from its own secret at run time.

## Documentation

| Document                                                           | What it covers                                                              |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| [`CONTRIBUTING.md`](CONTRIBUTING.md)                               | Branches, commits, and how a change reaches `main`                          |
| [`docs/engineering-guidelines.md`](docs/engineering-guidelines.md) | How the code is shaped, and why                                             |
| [`docs/architecture.md`](docs/architecture.md)                     | The folder tree, how a request renders, which components run in the browser |
| [`docs/content-guide.md`](docs/content-guide.md)                   | Editing the menu, hours and gallery without being a developer               |
| [`docs/baseline.md`](docs/baseline.md)                             | Measurements, with the date each was taken                                  |
| [`docs/access.md`](docs/access.md)                                 | Which account the site runs in, who holds access, where credentials live    |
| [`docs/decisions/`](docs/decisions/)                               | Why the significant choices were made                                       |

## Performance budget

The figures the migrated site must not regress against are recorded in
[`docs/baseline.md`](docs/baseline.md), together with the date each was measured.

## Licence

Proprietary. All rights reserved — see [`LICENSE`](LICENSE).
