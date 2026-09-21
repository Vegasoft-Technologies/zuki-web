# Access

Who can reach the production infrastructure, and where the credentials live. This file
records **where** each credential is kept, never the credential itself. Nothing in this
repository holds a secret; anything that looks like one in a commit is a defect to be
rotated and removed.

## Where the site runs

The site is deployed to a **dedicated Cloudflare account named "Vegasoft"**, separate from
any personal account that shares the same login. In Cloudflare a login can belong to
several accounts and switch between them, so this needs no second password. Everything
that belongs to this project — the Worker, its KV namespace, its Durable Object, and the D1
database — lives in that account and nowhere else.

The account holds only this project. Granting a colleague administrator rights on it
grants them nothing else.

| Resource                        | Where                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Worker `zuki-web`               | Vegasoft account, Workers & Pages; served at `https://zuki-web.vegasoft.workers.dev` until the domain is connected |
| KV namespace `zuki-web-cache`   | Vegasoft account, Workers KV (the incremental cache; safe to empty)                                                |
| Durable Object `DOQueueHandler` | Vegasoft account, bound to the Worker (revalidation queue)                                                         |
| D1 database                     | Vegasoft account, D1 (bookings; holds personal data)                                                               |
| Domain `zukiscaffetteria.co.uk` | A different Cloudflare account today — see `docs/decisions/0005-hosting.md`                                        |

## Who holds access

| Role                                  | Holder                                    | Notes                                  |
| ------------------------------------- | ----------------------------------------- | -------------------------------------- |
| Super Administrator, Vegasoft account | The repository owner                      | Two-factor authentication on the login |
| Second Super Administrator            | **Outstanding** — nobody as of 2026-09-21 | See the handover section               |

Until a second Super Administrator exists, the client's production site depends on one
person keeping access to one login. This is recorded here so it is fixed, not forgotten.

## Where the credentials live

| Credential                    | Where it lives                                                                      | Notes                                                                                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cloudflare login password     | The repository owner's password manager                                             | Never written down elsewhere. Cannot be revoked without locking everyone out, which is why nothing automated uses it.                                         |
| Deployment API token          | GitHub repository secret `CLOUDFLARE_API_TOKEN`; the owner's `.env.local`           | Scoped to the Vegasoft account only: Workers Scripts, D1, R2 and Workers KV edit. No zone permissions. Revocable and re-issuable from the Cloudflare profile. |
| Cloudflare account identifier | GitHub repository secret `CLOUDFLARE_ACCOUNT_ID`; the owner's `.env.local`          | Not a secret in itself, kept alongside the token for convenience.                                                                                             |
| Google Places API key         | Worker secret `GOOGLE_PLACES_API_KEY`; GitHub secret of the same name; `.env.local` | Needed at build time (the home page is prerendered) and at run time (daily revalidation). Restricted to the Places API in the Google console.                 |

The deployment token is deliberately not the account password and not the Global API
Key. A token can be revoked in one click; a password cannot be revoked without locking
everyone out. If the token is ever exposed, revoke it, issue a new one with the same
scope, and replace the repository secret.

## Go-live gate

**The real domain must not be connected until `BOOKING_NOTIFY_TO` points at the café.**
Bookings confirm instantly, and their notices go to an internal address until then; a
guest could hold a confirmed table the café knows nothing about. Connecting the domain and
switching that secret are one go-live step, together with whatever else is outstanding
(the second administrators, the DMARC policy, the Clarity project). Recorded in
`docs/decisions/0007` as well.

## Handover

**Handover.** This project has its own Cloudflare account, separate from any personal
one. When responsibility moves to Vegasoft, a colleague is added to this account as
Super Administrator and the outgoing administrator is removed from it. Nothing else
moves and no credential is shared. Until a second Super Administrator exists, the
client's production infrastructure has a single point of failure.
