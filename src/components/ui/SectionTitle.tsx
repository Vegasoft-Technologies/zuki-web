import type { ReactNode } from "react";

interface SectionTitleProps {
  id?: string;
  /** Modifier classes only. The base `section-title` class is applied here. */
  className?: string;
  children: ReactNode;
}

export default function SectionTitle({ id, className, children }: SectionTitleProps) {
  return (
    <h2 id={id} className={className ? `section-title ${className}` : "section-title"}>
      {children}
    </h2>
  );
}
