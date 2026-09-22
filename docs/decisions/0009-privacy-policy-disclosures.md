# 0009 — What the privacy policy discloses, and where the booking data actually is

**Status:** accepted, 2026-09-22

## Context

The policy at `/privacy` was read against UK GDPR Articles 12 and 13. Lawful basis,
purpose limitation, retention and cookie consent were already there and correct. Four
required disclosures were missing:

- the right to complain to the supervisory authority (Article 13(2)(d));
- whether the data leaves the United Kingdom (Article 13(1)(f));
- the full list of recipient categories — the policy named the service that delivers the
  booking notice but not the one that stores the booking (Article 13(1)(e));
- the Article 9 condition for the optional note, which the policy already describes as
  possibly holding health information.

Three of those can only be written honestly once it is known where the data is. A
privacy policy is a legal statement; a guess in it is a false statement. So the location
was checked before anything was written.

## What was checked, and what it showed

**The bindings**, from `wrangler.jsonc`: D1 `zuki-web-bookings` (binding `DB`), which
holds the bookings and the rate-limit counter, and Workers KV `NEXT_INC_CACHE_KV`, which
holds the incremental cache — prerendered pages and their fetched data, no booking data.

**`npx wrangler d1 info zuki-web-bookings`**, run twice:

| Credential                                                               | Result                                                                                              |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| The repository's default `CLOUDFLARE_API_TOKEN` — the Vegasoft account   | Failed: `The database 80efaa86-… could not be found [code: 7404]`. That account no longer holds it. |
| The deployment account's token, the one the live Worker is deployed with | `running_in_region: EEUR`, `jurisdiction: null`, `num_tables: 3`, created 2026-09-21                |

The failure is expected rather than a fault: the deployment moved into the account that
holds the domain on 2026-09-21, and this machine's default Cloudflare credential is
still the old account's. `docs/access.md` still describes the pre-move arrangement and is
due its own rewrite.

Read `EEUR` carefully. It is the Cloudflare region the database's primary currently runs
in — Eastern Europe — not a country, and `jurisdiction: null` means no restriction was
placed on where it may run. A D1 database takes a location hint only when it is created,
so this is not a setting that can be changed on the existing database.

**The email provider** is Resend (`0007-booking-architecture.md`, "How the café is
notified"; `docs/baseline.md`, 2026-09-21). **Its region is recorded nowhere in this
repository**, and it cannot be read back from here: the key is send-only, so
`GET https://api.resend.com/domains` answers `401 restricted_api_key`. It is therefore
treated as unconfirmed.

## Decision

**The policy names no country and no region.** It says the booking is stored by the
provider that hosts the site and the notice delivered by the email provider, that both
may hold it on servers outside the United Kingdom, and that where that happens it is
covered by contractual protections UK law recognises. That sentence is true of `EEUR`
today, stays true if the platform places the database elsewhere, and does not depend on
the email provider's region, which is unconfirmed.

The other three disclosures are written plainly, in the voice of the rest of the page:
the ICO by name with its website and telephone number; both suppliers in the "who sees
it" bullet; and, for the note, that choosing to write it is treated as explicit consent
for that one booking under Article 9(2)(a), with a reminder that it can be left empty.

## What is still open

- **A written contact route.** Article 12 asks that rights requests be made easy, and the
  policy still offers only a telephone number and Instagram — neither leaves the person a
  record. It should offer an email address, and that address must be the café's. The only
  address configured for booking notices is the repository owner's own, kept internal on
  purpose until the café takes the notices over (`0007`, amendment of 2026-09-21), and
  publishing an agency address as the café's would be wrong. The café's own address is in
  no file here, by design. This disclosure waits on that address and is a small change
  when it arrives.
- **Naming the place.** If the café wants its customers' bookings kept in a particular
  place, that is a database created with a location hint and the rows moved to it — a
  deliberate piece of work, not a setting. The sentence above can name the place on the
  day that is true and the email provider's region is confirmed in writing.

## Consequences

- The sentence about where the data is kept and this record change together. If the
  bookings move to another provider, another account or a pinned region, both are edited
  in the same change, or the policy quietly stops being true.
- Any future check against the live database needs the deployment account's credential,
  not this machine's default one.
- Separately, in the same change, the structured data's `priceRange` became the relative
  indicator `"££"`. The rule in `0004-menu-data-model.md` that it is derived from the
  lowest and highest amount on the menu no longer applies: the lowest was a side item and
  the highest a sharing platter, so the derived range described the café worse than two
  characters do.
