import type { MenuCategory } from "@/types/menu";

interface MenuPanelProps {
  category: MenuCategory;
}

export default function MenuPanel({ category }: MenuPanelProps) {
  return <div id={category.id} />;
}
