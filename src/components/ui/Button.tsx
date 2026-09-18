import type { ReactNode } from "react";

interface ButtonProps {
  href: string;
  /** Modifier classes only. The base `btn` class is applied here. */
  className?: string;
  children: ReactNode;
}

export default function Button({ href, className, children }: ButtonProps) {
  return (
    <a href={href} className={className ? `btn ${className}` : "btn"}>
      {children}
    </a>
  );
}
