import type { ReactNode } from "react";

interface EyebrowProps {
  /** Modifier classes only. The base `eyebrow` class is applied here. */
  className?: string;
  children: ReactNode;
}

export default function Eyebrow({ className, children }: EyebrowProps) {
  return <p className={className ? `eyebrow ${className}` : "eyebrow"}>{children}</p>;
}
