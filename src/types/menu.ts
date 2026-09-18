export type Diet = "vegetarian" | "vegan" | "gluten-free";

export interface MenuItem {
  name: string;
  /**
   * Exactly as the menu prints it: "£12.95", but also "£2.45 / £2.75" for two sizes,
   * "£5 / £7 / £25" for glass, carafe and bottle, and "+£0.50" for a supplement.
   * Absent on the eleven items that carry no price of their own, such as the gelato
   * flavours, which are priced by the scoop on their group heading.
   */
  price?: string;
  /**
   * The lowest amount in `price`, in pounds. Lowest, because that is what a range should
   * sort by: a wine listed `£5 / £7 / £25` belongs with the five pound drinks, not the
   * twenty-five pound ones.
   *
   * When a group is ordered by price, items with no `amount` sort last, after every
   * priced item, keeping the order they are written in here. Eleven items have no price
   * of their own and would otherwise have no defined position.
   *
   * Do not use a single item's `amount` for the `priceRange` in the structured data.
   * That is derived from the lowest and the highest amount across the whole menu.
   */
  amount?: number;
  description?: string;
  diet?: Diet[];
  /** A marker printed like a diet tag but not dietary, such as "0%" for alcohol-free. */
  badge?: string;
}

export interface MenuGroup {
  title: string;
  /** Printed small beside the title, such as the per-scoop prices for gelato. */
  hint?: string;
  /**
   * Which of the two columns the group sits in.
   *
   * This describes content, not styling. The two columns hold different groups — the
   * breakfast panel has "Breakfast & Brunch" on the left and "Local favourite" and
   * "Sides" on the right — rather than one list reflowing into two. Which group belongs
   * on which side is an editorial choice and cannot be derived, so it is recorded here.
   */
  column: 1 | 2;
  /** The denser list used for the gelato flavours. */
  compact?: boolean;
  items: MenuItem[];
  /** A footnote under the list, such as the milk and syrup supplements. */
  fineprint?: string;
}

export interface MenuCategory {
  id: "breakfast" | "sharing" | "mains" | "coffee" | "gelato" | "drinks";
  label: string;
  /** An introduction above the columns. Only the gelato category has one. */
  note?: string;
  groups: MenuGroup[];
  feature?: {
    title: string;
    description: string;
    price: string;
    /** The second price, where an item is sold in two sizes. */
    priceAlt?: string;
  };
}
