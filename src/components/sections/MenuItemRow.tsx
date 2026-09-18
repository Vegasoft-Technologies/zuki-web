import type { MenuItem } from "@/types/menu";

interface MenuItemRowProps {
  item: MenuItem;
}

export default function MenuItemRow({ item }: MenuItemRowProps) {
  return <li>{item.name}</li>;
}
