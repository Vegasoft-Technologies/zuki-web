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
  /** The lowest amount in `price`, in pounds, for sorting and structured data. */
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
  /** Which of the two columns the group sits in. */
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
