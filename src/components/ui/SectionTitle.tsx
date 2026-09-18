import type { ReactNode } from "react";

interface SectionTitleProps {
  id?: string;
  className?: string;
  children: ReactNode;
}

export default function SectionTitle({ id, className, children }: SectionTitleProps) {
  return (
    <h2 id={id} className={className}>
      {children}
    </h2>
  );
}
