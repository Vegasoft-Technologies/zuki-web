import type { ReactNode } from "react";

interface EyebrowProps {
  className?: string;
  children: ReactNode;
}

export default function Eyebrow({ className, children }: EyebrowProps) {
  return <p className={className}>{children}</p>;
}
