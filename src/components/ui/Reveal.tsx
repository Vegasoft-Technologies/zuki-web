"use client";

import type { ReactNode } from "react";

interface RevealProps {
  className?: string;
  children: ReactNode;
}

export default function Reveal({ className, children }: RevealProps) {
  return <div className={className}>{children}</div>;
}
