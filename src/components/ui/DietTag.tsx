import type { Diet } from "@/types/menu";

const LABELS: Record<Diet, string> = {
  vegetarian: "V",
  vegan: "Vg",
  "gluten-free": "GF",
};

interface DietTagProps {
  diet: Diet;
}

export default function DietTag({ diet }: DietTagProps) {
  const className = diet === "vegan" ? "mi__diet mi__diet--vg" : "mi__diet";
  return <em className={className}>{LABELS[diet]}</em>;
}
