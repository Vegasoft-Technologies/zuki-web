import type { MenuItem } from "../types/menu.ts";

/**
 * Orders a group's items by ascending price.
 *
 * Items with no `amount` — the gelato flavours and the smoothies, which are priced on
 * their group heading — sort last, after every priced item, in the order they were
 * written. That rule is recorded next to the field in `src/types/menu.ts`.
 *
 * Applied at render time rather than to the data file, so `menu.ts` stays in the order
 * a person would read the printed menu. The sort is stable, which is what keeps equal
 * prices and the unpriced tail in their written order.
 */
export function byAscendingPrice(items: readonly MenuItem[]): MenuItem[] {
  return [...items].sort(
    (a, b) =>
      (a.amount ?? Number.POSITIVE_INFINITY) - (b.amount ?? Number.POSITIVE_INFINITY),
  );
}
