# 0007 — Booking architecture

**Status:** proposed — awaiting approval before any implementation

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

### How the café is notified

Through a `Notifier` interface with one operation: deliver a booking notice. Two
implementations: a logging notifier for development and tests, and a transactional email
notifier for production, which needs a provider key held in an environment variable and
is added with hosting. Email rather than SMS to start: it costs nothing per message,
carries the full booking, and the café already publishes an email address. SMS can be a
second notifier later if the café wants it.

### Confirmation: by a person, to begin with

A reservation is a **request** until the café confirms it. The form says so before the
visitor commits, and the success message repeats it.

Reason: every capacity rule is provisional. Confirming automatically on rules the café
has not validated would overbook a small room on the first busy Saturday. A single
configuration flag switches to automatic confirmation once the café has run with the
rules for a few weeks and is happy with them.

### Personal data

Collected: name, party size, date, time, one contact method (telephone or email, the
visitor's choice), and an optional free-text note capped in length.

Lawful basis: UK GDPR Article 6(1)(b) — the processing is necessary to take steps at the
request of the data subject before entering a contract, namely holding a table. No
consent box is needed for this and none is shown. It is not a marketing consent and is
not used as one: no newsletter checkbox, nothing pre-ticked, nothing sent beyond the
booking itself.

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
- A honeypot field that must arrive empty.
- A cap on the request body size, enforced before parsing.

## Consequences

- The feature can be built, tested and reviewed end to end now, against the in-memory
  store, without choosing a host or adding a dependency.
- Going live needs three things that wait on `0005`: the Postgres adapter, the email
  notifier, and a production rate limiter. Each is a small file behind an interface that
  already exists.
- The café has to answer the provisional questions before automatic confirmation is
  switched on. Until then a person confirms every booking, which is more work for them
  but cannot overbook the room.
- The privacy page changes from "we collect nothing" to a real description of what is
  held and why, which is the correct state for a site that takes bookings.
- The structured data's `acceptsReservations` becomes true in fact rather than only by
  telephone, once the form is live.
