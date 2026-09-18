export type Diet = "vegetarian" | "vegan" | "gluten-free";

export interface MenuItem {
  name: string;
  price: number; // pounds, e.g. 12.95
  description?: string;
  diet?: Diet[];
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export interface MenuCategory {
  id: "breakfast" | "sharing" | "mains" | "coffee" | "gelato" | "drinks";
  label: string;
  groups: MenuGroup[];
  feature?: { title: string; description: string; price?: number };
}
