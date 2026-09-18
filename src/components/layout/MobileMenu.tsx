"use client";

import { useEffect } from "react";
import { site } from "@/data/site";

interface MobileMenuProps {
  open: boolean;
  /** Called when a link is followed, so the header can close the menu. */
  onNavigate: () => void;
}

export default function MobileMenu({ open, onNavigate }: MobileMenuProps) {
  // Hold the page still behind the open menu. Hiding the overflow keeps the scroll
  // position by itself, so nothing has to be restored on close; the padding replaces
  // the scrollbar's width so the layout does not jump as it disappears.
  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbar > 0) {
      body.style.paddingRight = `${scrollbar}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [open]);

  return (
    <div className="mobile-menu" id="mobileMenu" hidden={!open}>
      <a href="#story" onClick={onNavigate}>
        Story
      </a>
      <a href="#menu" onClick={onNavigate}>
        Menu
      </a>
      <a href="#gallery" onClick={onNavigate}>
        Gallery
      </a>
      <a href="#visit" onClick={onNavigate}>
        Visit
      </a>
      <a
        className="mobile-menu__call"
        href={`tel:${site.telephone}`}
        onClick={onNavigate}
      >
        Call {site.telephoneDisplay}
      </a>
    </div>
  );
}
