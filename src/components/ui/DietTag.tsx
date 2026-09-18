import type { Diet } from "@/types/menu";

interface DietTagProps {
  diet: Diet;
}

export default function DietTag({ diet }: DietTagProps) {
  return <span data-diet={diet} />;
}
