# 0007 — Booking architecture

**Status:** accepted, 2026-09-20 (amended 2026-09-20: instant confirmation is the requirement; amended 2026-09-21: the store is D1)

## Context

Online table reservation is the client's first stated gap. Today the only way to book is
to telephone. The site is a static Next.js build with no server-side state, and the
hosting platform is not yet decided (`0005-hosting.md`), so a design that assumes a
particular host would have to be redone.

Several rules a booking system depends on are unknown: how long a sitting lasts, how
many covers a slot holds, the largest party accepted online, how much notice is needed,
how far ahead the calendar opens, and whether the kitchen stops seating before closing.
None of these can be guessed. They are parameterised with provisional defaults and
listed as questions for the café.

## Decision

### Where reservations are stored

A relational database, reached through a small `BookingStore` interface with two
operations: read the covers already booked for a slot, and reserve — an atomic
"insert if capacity allows" that either succeeds or reports the slot full.

The interface exists so that the storage engine is a plug-in. Two implementations:

- **In-memory**, used by the tests and by local development. No service, no key, no
  dependency. It is also what this record's implementation ships with, so the whole
  feature can be built and verified now.
- **Postgres**, added when hosting is settled. It is the one choice that survives all
  three options in `0005`: a Node host connects directly, an edge host through an HTTP
  driver, and a separate API host owns it outright. It also provides what the capacity
  check needs — a transaction that makes "count then insert" a single step, so two
  visitors cannot both take the last table. Adding its driver is a dependency and will be
  raised in its own pull request with the reason.

A read followed by a write is explicitly not acceptable for the capacity check; the
in-memory store serialises reservations per slot, and the Postgres store will do it with
a transaction at `SERIALIZABLE` or an advisory lock keyed on the slot.

**Amendment, 2026-09-21.** Hosting is settled on Cloudflare (`0005`), and the store is
**Cloudflare D1**, not Postgres: it is on the same account, has a free tier, and needs no
second vendor or driver. D1 has no interactive transactions, so the capacity check is not
a transaction but a single guarded statement: an `INSERT … SELECT … WHERE` whose `SELECT`
produces a row only while the party still fits within the overlapping covers. SQLite
executes one statement atomically under the database's single write lock, so two
requests for the last covers cannot both see room. The schema is versioned as SQL files
in `migrations/`. The Postgres paragraphs above are kept as the record of what was
planned before the host was known.

### How the café is notified

Through a `Notifier` interface with one operation: deliver a booking notice. Two
implementations: a logging notifier for development and tests, and a transactional email
notifier for production, which needs a provider key held in an environment variable and
is added with hosting. Email rather than SMS to start: it costs nothing per message,
carries the full booking, and the café already publishes an email address. SMS can be a
second notifier later if the café wants it.

### Confirmation: instant is the requirement; manual is the interim setting

The requirement is **instant confirmation**: the visitor picks a slot, submits, and
leaves with a confirmed table. This comes from the client's analysis, which records that
customers expect an instant digital booking option, that the business loses them to
venues that offer one because the site lacks a real-time reservation infrastructure, and
that the local and tourist audience wants to book a guaranteed table. An earlier draft
of this record chose manual confirmation as the default; that was decided without
consulting the analysis and is corrected here.

Manual confirmation stays in the code, with a different role: it is a **temporary
setting** used only while the café's capacity rules are unknown. Confirming instantly
against a covers-per-slot figure nobody has supplied would overbook a small room, so
the system ships with manual confirmation on.

One configuration value switches between the two. Flipping it is the last step of this
work, done the day the café answers the six provisional questions. Both sets of interface
text are written now so that the switch changes no code:

- **manual:** before submitting, the visitor is told the café will confirm the booking
  by their chosen contact method; after submitting, that the request has been received
  and is not yet a confirmed table.
- **instant:** before submitting, the visitor is told the table will be held on
  submission; after submitting, that the table is held, with the slot repeated back.

### Personal data

Collected: name, party size, date, time, one contact method (telephone or email, the
visitor's choice), and an optional free-text note capped in length.

Lawful basis: UK GDPR Article 6(1)(b) — the processing is necessary to take steps at the
request of the data subject before entering a contract, namely holding a table. No
consent box is needed for this and none is shown. It is not a marketing consent and is
not used as one: no newsletter checkbox, nothing pre-ticked, nothing sent beyond the
booking itself.

**The free-text note may contain special category data.** It is labelled "Anything we
should know?" beside a menu that invites guests to mention allergies, so it predictably
collects dietary, allergy and accessibility needs — health information under UK GDPR
Article 9, which the contract basis above does not cover on its own. The system treats it
accordingly: the note is used only to prepare for that one visit, it is shown only to the
café, it is never copied into any other system (no spreadsheet, no message thread, no
customer list), and it is deleted with the booking. Whoever operates the system must keep
to that, and if the retention period below ever changes, the note changes with it — it is
never kept longer than the booking.

Retention: **30 days after the sitting date** (provisional), then deleted. Long enough to
handle a no-show or a query; short enough that the database never becomes a customer
list.

Shared with: the email provider, as a processor, to deliver the notice to the café.
Nobody else.

Rights: the privacy page will say how to ask for a booking's details or its deletion —
by email to the café — and `/privacy` is updated in the same pull request as the form.

### Protecting a public endpoint

`POST /api/bookings` will be found by bots within days of going live.

- Server-side validation with a schema that returns field-level errors. Written in the
  project rather than adding a validation library; it is a dozen fields and the rules are
  ours. If it grows past that, a library is the right call and will be proposed.
- Rate limiting by address, behind an interface for the same reason as the store: an
  in-memory bucket is correct on one process and wrong on serverless, so the production
  limiter is chosen with hosting.

  **Amendment, 2026-09-21.** On the deployed Worker the in-memory limiter never
  triggered: each isolate kept its own tally. The production limiter now counts in D1
  (`rate_limit_hits`, migration `0002`), with one guarded `INSERT` that both decides and
  records, so every isolate sees the same count and a burst cannot slip past it. D1 rather
  than KV because KV permits one write per second per key and is eventually consistent,
  and a limiter needs an exact, immediate count. The caller's address is read only from
  `CF-Connecting-IP`, which the edge sets and a caller cannot forge; a request without it
  is refused rather than keyed on a header the caller supplied. The in-memory limiter
  remains behind the same interface for the tests and local development.

- A honeypot field that must arrive empty.
- A cap on the request body size, enforced before parsing.

## Consequences

- The feature can be built, tested and reviewed end to end now, against the in-memory
  store, without choosing a host or adding a dependency.
- Going live needs three things that wait on `0005`: the Postgres adapter, the email
  notifier, and a production rate limiter. Each is a small file behind an interface that
  already exists.
- The café has to answer the six provisional questions before the confirmation setting
  is switched to instant. Until then a person confirms every booking, which is more work
  for them but cannot overbook the room. Instant confirmation, not manual, is the state
  the work is finished in.
- The privacy page changes from "we collect nothing" to a real description of what is
  held and why, which is the correct state for a site that takes bookings.
- The structured data's `acceptsReservations` becomes true in fact rather than only by
  telephone, once the form is live.
