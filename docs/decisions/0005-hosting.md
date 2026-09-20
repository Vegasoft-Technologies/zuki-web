# 0005 — Hosting platform

**Status:** proposed — a recommendation, awaiting a commercial decision

## Context

The site is not deployed. The production site is static files behind Cloudflare, which is
what the client's measured baseline describes: 0.532 s download, 0.198 s page load, 19
requests. The rebuild changes what hosting must provide:

- It has a build step. Whatever hosts it must run `next build`, or receive its output.
- It will have a booking endpoint (`0007`) that needs a runtime and a database, and a
  rating fetch (Part 3) that needs a server-side cache.
- The `/privacy.html` redirect now lives in `next.config.ts` rather than in a hosting rule.
- `images.unoptimized` is on. Switching it off means either Next's own image optimiser
  (needs a Node runtime) or a loader that points at a CDN's resizer.

Two figures matter throughout. The performance budget is under two seconds, against a
baseline no host will struggle with for a page this size. And the request count: anything
behind Cloudflare gets its bot-detection script injected at the edge, which adds requests
the client's figure of 19 never counted and runs before the consent gate the application
implements (`docs/baseline.md`).

## The options

### A — Keep the current arrangement: static files behind Cloudflare

Export the site as static HTML (`output: "export"`) and serve it from Cloudflare Pages as
today.

|                           |                                                                                                                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cost                      | Free tier is ample for this traffic                                                                                                                                                          |
| Runs the booking endpoint | **No.** A static export has no server. The endpoint would have to become a Cloudflare Worker with a bound database (D1 or a Postgres over HTTP), built and deployed separately from the site |
| Keeps the baseline        | Yes; static files on a CDN is what produced the baseline                                                                                                                                     |
| Image loader              | No Node runtime, so no built-in optimiser. Either serve the generated AVIF/WebP through a custom loader with `<picture>`-style fallbacks, or pay for Cloudflare Images                       |
| The redirect              | Must be re-created as a `_redirects` rule; the one in `next.config.ts` is ignored by a static export                                                                                         |
| Injected script           | Present, unless Bot Fight Mode is turned off                                                                                                                                                 |

Two systems to build, deploy and keep in step — the site and a Worker — and two things
the application already does correctly (the redirect, image handling) have to be redone
outside it.

### B — A Next.js-native host

A platform that runs the App Router as intended: Vercel is the reference implementation;
Netlify and Cloudflare's own Next adapter are the alternatives.

|                           |                                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cost                      | Free tier for one site at this traffic; a paid seat is around £15–20 a month if the team wants preview deployments per pull request and a second member |
| Runs the booking endpoint | **Yes**, as a route handler in the same deployment. A managed Postgres (the platform's own, or Neon) attaches with one environment variable             |
| Keeps the baseline        | Yes. Both pages are statically prerendered and served from the edge; only `/api/bookings` runs code, and only when called                               |
| Image loader              | Built in. Turn `unoptimized` off and the `sizes` values and formats from 1.4 take effect with no further change                                         |
| The redirect              | Works as written                                                                                                                                        |
| Injected script           | None, unless Cloudflare is placed in front of it — which would be a choice, not a default                                                               |

One deployment, one repository, everything the application already does works as
written. The cost is a dependency on a platform's pricing and a region choice: the site
must be pinned to a London region for the endpoint, since the audience is in Exeter.

### C — Static export plus a separate API

The site as in A, on any static host; the booking endpoint as a small separate service
(a Worker, a Lambda, or a container).

|                           |                              |
| ------------------------- | ---------------------------- |
| Cost                      | Comparable to A              |
| Runs the booking endpoint | Yes, in the separate service |
| Keeps the baseline        | Yes for the site             |
| Image loader              | As A                         |
| The redirect              | As A                         |
| Injected script           | Depends on the static host   |

This is A with the Worker made explicit. It has the same two-system cost and additionally
a cross-origin form post, which brings CORS and a second domain into a feature that is
otherwise simple.

## Recommendation

**B — a Next.js-native host, pinned to a London region, with a managed Postgres.**

The deciding facts are not speed — every option is fast enough — but that the
application already implements the redirect, the image handling and the API in one place,
and only B runs all three as written. A and C move two of them back out into hosting
configuration and add a second deployable, which is the shape of system the migration was
meant to remove.

If cost is the overriding concern, Cloudflare's own Next adapter is the version of B that
stays on the free tier; it should be evaluated against the same table before committing,
since its support for App Router features lags the reference platform.

## What is settled by this, once the host is known

- **The image loader.** On B: turn `unoptimized` off. On A or C: a custom loader plus
  fallbacks.
- **The canonical trailing slash.** On B the canonical stays `https://zukiscaffetteria.co.uk`
  (no slash), which Next emits and which is equivalent for a site root. Only a static host
  that serves `index.html` at `/` makes the slash form the natural one.
- **The two external validators** (Schema.org, Rich Results) run against the first public
  deployment and their output goes in `docs/baseline.md`.
- **The Postgres adapter, the email notifier and the production rate limiter** from
  `0007` are each written against the chosen platform's primitives.

## Consequences

- Deploying needs account access, a region choice and a commercial decision. None of
  those are the engineer's to make, so this record stops at a recommendation.
- Until it is made, `#30` stays open and everything in `0007` that touches a real service
  stays behind its interface.
- Whichever option is chosen, the first post-deployment measurement is compared against
  the baseline **with the injected-script caveat applied**, or the comparison is
  meaningless.
