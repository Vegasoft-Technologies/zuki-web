# 0004 — Prices are strings, with a separate sortable amount

**Status:** accepted, 2026-09-18

## Context

The menu was specified as `price: number`, required, "pounds, e.g. 12.95", so that items
could be sorted and formatted consistently. Transcribing the real menu showed that it
does not fit:

- **Eleven of the 132 items have no price at all.** The gelato flavours and the
  smoothies are priced by the scoop or on their group heading.
- **Twenty-one prices are not a single figure.** Two sizes (`£2.45 / £2.75`), wine by
  the glass, carafe and bottle (`£5 / £7 / £25`), supplements (`+£0.50`), and whole
  pounds printed without decimals (`£9`).

A required number cannot represent any of those, and formatting one back would print
`£9.00` where the menu prints `£9`. Since the migration is judged on rendering exactly
what is live, that is not a detail that can be smoothed over.

## Decision

```
price?:  string   exactly as the menu prints it
amount?: number   the lowest figure in that string
```

`price` is what gets rendered. `amount` exists for sorting and for the structured data,
and is absent on the eleven items that have no price.

Two rules follow, both written next to the fields they govern:

- When a group is ordered by price, items with no `amount` sort **last**, after every
  priced item, in the order they are written.
- The `priceRange` in the structured data is derived from the lowest and highest amount
  across the whole menu, never from one item — and excludes supplements, because a
  `+£0.50` for sprinkles is a modifier, not something anyone can buy.

Four other fields exist because the markup has them and the original type did not:
`hint` on a group, `compact` for the denser gelato list, `note` for a panel
introduction, and `fineprint` for a footnote under a list. `MenuGroup` also carries
`column`, which describes content rather than styling: the two columns hold different
groups, and which group sits on which side is an editorial choice that cannot be
derived.

## Consequences

- The rendered prices match the production page exactly: 167 money values, in order.
- Sorting by price is still possible, and has a defined answer for unpriced items.
- Whoever edits a price has to change two fields that must agree. The content guide
  says so plainly. A single field would have been nicer to edit and unable to render
  the menu.
