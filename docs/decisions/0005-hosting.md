# 0005 — Hosting platform

**Status:** proposed

## Context

The site is not deployed yet. The production site is served as static files behind
Cloudflare, which is why the recovered copy carries a bot-detection script the source
never had — see `docs/baseline.md`.

The rebuild changes what hosting has to provide. It has a build step, and it will
shortly have two server-side concerns: a booking API and a review fetcher. Two of the
current arrangements will not survive the move on their own:

- The redirect from `/privacy.html` to `/privacy` is a hosting rule today. It now lives
  in `next.config.ts`, so it travels with the application — but only on a host that runs
  the application rather than serving files.
- Anything behind Cloudflare will have the bot-detection script injected again, which
  adds requests the client's original figure of 19 never counted. Any comparison against
  that figure has to account for it.

## Decision

Not taken. Deliberately left open until the booking API is specified, because whether
the site needs a Node runtime, edge functions or only periodic rebuilds depends on what
that API turns out to need.

## What has to be true of whatever is chosen

- Runs a Next.js App Router build, not only static files, so the redirect and the
  coming APIs work.
- Serves from or near the United Kingdom; the audience is in Exeter.
- Does not regress the measured baseline: 0.532 s download, 0.198 s page load, and a
  low request count.
- Lets the team see whether a bot-detection or analytics script is being injected at the
  edge, since anything injected there bypasses the consent gate the application
  implements.

## Consequences

- Deployment is blocked until this is decided, and this is tracked as an open issue.
- `docs/baseline.md` records the measurements taken so far so that the first
  post-deployment measurement has something to be compared against.
