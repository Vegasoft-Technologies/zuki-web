import type { ReactNode } from "react";

interface ButtonProps {
  href: string;
  className?: string;
  children: ReactNode;
}

export default function Button({ href, className, children }: ButtonProps) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
