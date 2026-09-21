"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

interface BookTableLinkProps {
  className: string;
  children: ReactNode;
}

/**
 * "Book a table", taking the visitor to the booking form.
 *
 * A link to "/#book" only scrolls when the address changes. Once the address already
 * ends in #book, a second press leaves the page where it is, so a visitor who scrolled
 * back up could not reach the form again. On the home page the press therefore scrolls
 * to the form itself, every time. Elsewhere it is an ordinary link to the home page's
 * form. The scroll follows the stylesheet's `scroll-behavior`, so it is smooth, and
 * instant for a visitor who has asked for less motion.
 */
export default function BookTableLink({ className, children }: BookTableLinkProps) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname !== "/") return;
    const form = document.getElementById("book");
    if (!form) return;
    event.preventDefault();
    form.scrollIntoView({ block: "start" });
    if (window.location.hash !== "#book") window.history.pushState(null, "", "/#book");
  };

  return (
    <Link className={className} href="/#book" onClick={onClick}>
      {children}
    </Link>
  );
}
