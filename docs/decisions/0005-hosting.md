# 0005 — Hosting platform

**Status:** accepted, 2026-09-21 — Cloudflare Workers, in a dedicated Cloudflare account

The options below were written while the choice was open and are kept as the record of
what was weighed. The decision and its consequences follow them.

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

## Recommendation, as made before the decision

**B — a Next.js-native host.** The deciding facts are not speed — every option is fast
enough — but that the application already implements the redirect, the image handling
and the API in one place, and only B runs all three as written. A and C move two of them
back out into hosting configuration and add a second deployable, which is the shape of
system the migration was meant to remove.

## Decision

**Cloudflare Workers, through the `@opennextjs/cloudflare` adapter**, deployed to a
dedicated Cloudflare account for this project. This is option B in its Cloudflare form.

`@cloudflare/next-on-pages` is not used. It targets Cloudflare Pages and is no longer the
maintained path for Next.js; the Workers adapter is.

Three reasons decided it:

1. **The client is already a Cloudflare customer.** The domain resolves through
   Cloudflare and the CDN in front of the current site is Cloudflare. Staying there adds
   no vendor, no new invoice and no new relationship to explain.
2. **The published case study describes the site as running on Cloudflare.** Moving it
   elsewhere would make that description untrue.
3. **The free tier permits commercial use.** A café's website is a commercial site. Some
   alternatives' free tiers forbid commercial projects, which would have meant a paid
   plan from the first day; Workers, D1 and R2 do not, and everything this site needs
   fits inside their free allowances. No paid product is enabled. In particular Cloudflare
   Images is not: the AVIF and WebP files are generated in the repository and served
   directly.

### The cost that comes with it

Workers is not a Node runtime. Next's own image optimiser, which needs one, is therefore
unavailable, and the custom image loader exists because of this: it maps each request to
the best already-generated file and negotiates the format itself. That is one component
this project maintains that a Node host would have provided.

### What changes now the site is hosted

- **Image delivery becomes real.** `images.unoptimized` is switched off, the `sizes`
  attributes and the generated formats reach the browser, and the download sizes recorded
  in `docs/baseline.md` finally change.
- **The rating's daily revalidation actually revalidates.** The adapter's incremental
  cache is configured on R2. Without it the figure would be fixed at build time, which
  contradicts the requirement that it follow the review metrics.
- **The two external validators become runnable.** Schema.org and Google's Rich Results
  test need a public URL; their output goes in `docs/baseline.md`.

### Two things that do not compare directly with the old figures

- **The injected script.** Any Cloudflare deployment has the edge-injected bot-detection
  script described in `docs/baseline.md`. Our measured request count therefore includes
  requests that the client's original figure of 19 never counted, and the two must not be
  compared without saying so.
- **The runtime.** The old site was static files; this one is a Worker in front of static
  assets. Both pages are still prerendered, so a visitor still receives finished HTML, but
  the first-byte figure is now a Worker's, not a file server's.

### Which account, and why it matters

The site is deployed to a **dedicated Cloudflare account, "Vegasoft"**, not to the
personal account that holds the repository owner's own sites. In Cloudflare one login can
belong to several accounts, so this is a second container under the same login, not a
second set of credentials. `docs/access.md` records who holds access and where the
credentials live; nothing in this repository holds a credential.

Two consequences follow, and both are deliberate:

- **The domain is in a different account.** `zukiscaffetteria.co.uk` already resolves
  through Cloudflare, so a separate account holds that zone. Binding a custom domain to a
  Worker is simplest when the zone and the Worker share an account; across accounts it is
  done with a DNS record in the zone's account pointing at the `workers.dev` address,
  which works but is an extra step. **The tidiest end state is for the zone to be
  transferred into the Vegasoft account.** That is a decision for whoever holds the zone
  today, and no DNS change is made as part of the deployment work.
- **Everything must be in the Vegasoft account before the site goes live.** D1 and R2 are
  per-account and start empty in a new one. Redeploying the same repository elsewhere
  changes no code, but moving after real bookings exist means migrating real customers'
  personal data, whereas moving while the database holds only test bookings costs
  nothing. Starting in the Vegasoft account avoids the problem. A later change of account
  must not be made casually, for exactly this reason.

## What is settled by this

- **The image loader.** A custom loader plus a small route that negotiates the format
  from the `Accept` header, serving the generated AVIF, WebP or original JPEG.
- **The canonical trailing slash.** The canonical stays `https://zukiscaffetteria.co.uk/`,
  which Next emits for the site root; it is checked against what the Worker serves once
  deployed, and whichever end disagrees is fixed.
- **The two external validators** run against the first deployment and their output goes
  in `docs/baseline.md`.
- **The booking store** from `0007` is written against D1, which is on the same account
  and needs no second vendor; the Postgres option in that record is superseded. The email
  notifier and the production rate limiter remain to be written.

## Consequences

- Deploying is now an engineering task rather than a commercial question, so `#30`
  closes with this record.
- The project owns one component a Node host would have provided: the image loader and
  its format negotiation.
- Every post-deployment measurement is recorded as "behind Cloudflare, including the
  injected script", or the comparison with the baseline is meaningless.
- Handover of the site is handover of one Cloudflare account, described in
  `docs/access.md`. Until a second administrator exists there, the production
  infrastructure depends on one person keeping access to one login.
