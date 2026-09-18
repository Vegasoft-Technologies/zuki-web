# 0002 — The stylesheet is preserved, not rewritten

**Status:** accepted, 2026-09-18

## Context

`src/app/globals.css` is the production stylesheet, moved into the project. The obvious
instinct on a rebuild is to modernise it: split it into modules, convert it to a utility
framework, reorder it mobile-first.

The stylesheet is also the only reliable description of how the site is meant to look.
There is no design file. If it is rewritten, there is nothing left to check the rebuild
against.

It is already good. Of its 228 rules, 212 sit outside any media query and adapt through
`clamp()`, scaling smoothly rather than jumping at a threshold. Only sixteen rules live
in media queries, at 920px and 680px, and they handle the two things that cannot be
fluid: the navigation swap and the number of grid columns.

## Decision

Move it. Do not edit it.

Specifically: no CSS Modules, no utility framework, no CSS-in-JS. No reordering, no
reformatting, no tidying. No renaming a class — the names are the contract between the
markup and the stylesheet, and every one of them is checked against `reference/`.

It is also not converted to mobile-first authoring order. That rewrite touches roughly
thirty rules, changes nothing a visitor can perceive, and throws away the node-by-node
verification that makes the migration checkable.

Where a later phase genuinely needs CSS, it is **appended** in a marked block with a
reason, never woven into the original.

## Consequences

- The rendered page can be compared against the production copy at any time, and has
  been: every section matches node for node.
- Prettier is configured to skip the file, so it cannot be reformatted by accident.
- New CSS written after the migration is authored mobile-first, reusing the existing
  681px and 921px thresholds rather than introducing new ones.
- The file is long and not organised the way a new project would be. That is accepted:
  its value is being unchanged.
