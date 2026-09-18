# 0001 — Next.js

**Status:** accepted, 2026-09-18

## Context

The site was hand-written HTML, CSS and vanilla JavaScript, served statically. It worked
and it was fast: 0.532 s download, 0.198 s page load, 19 requests. Nothing about it was
broken.

Two things are coming that it cannot absorb. Online table reservation needs a booking
API, and the client wants live review counts and ratings on the page, which needs
something to fetch them. Both need a server, a build step, or both. The existing site
has neither, and the source was not under version control.

## Decision

Rebuild in Next.js with the App Router and TypeScript, while keeping the rendered output
identical to what is live.

Server Components by default, so the page still arrives as complete HTML and the parts
that cannot be static are the exception rather than the rule.

## Consequences

- There is somewhere for the two APIs to live when they arrive, without another rewrite.
- The content moved out of the markup into `src/data/`, so a price change no longer
  means editing a component.
- The site now has a build step, a dependency tree and a deployment target it did not
  have before. That is the real cost, and it is paid for by the two features above.
- The rendered HTML is larger: 155 KB against 53 KB, most of the difference being the
  framework's streaming payload. This is recorded in `docs/baseline.md` and is worth
  revisiting.
- Every part of the migration is checked against `reference/`, node for node, so the
  rebuild can be shown to have changed nothing a visitor sees.
