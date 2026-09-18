# 0003 — Third-party embeds load only after consent

**Status:** accepted, 2026-09-18

## Context

The visit section shows a Google Maps embed. Loading an embed contacts Google and can
set cookies before the visitor has agreed to anything. Under UK GDPR and the
Information Commissioner's Office guidance, non-essential cookies need consent first,
and consent means a positive action rather than a pre-ticked box or continued browsing.

## Decision

Nothing third-party is requested until the visitor asks for it.

The map renders as a placeholder with a "Show map" button and a plain link to Google
Maps for anyone who would rather not load it at all. The iframe is created only when the
button is pressed, or when a stored choice of "accept all" is found.

The banner offers two real options: "Essential only" and "Accept all". Choosing
"Essential only" is a genuine choice, not a delay — the map still does not load, and
the manual button still works for anyone who wants it on that visit.

## Consequences

- With a fresh browser profile, no request reaches google, gstatic or maps until the
  button is pressed or consent is stored. This is verified on the network rather than
  asserted.
- The consent choice is the only thing stored, under one key.
- Reading storage can throw outright in private browsing. That is treated as "no choice
  recorded": the banner appears, the choice works for that page view, nothing is stored,
  and the page renders in full.
- Any analytics added later has to go behind the same gate. There is none today.
