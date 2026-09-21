"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import MobileMenu from "./MobileMenu";
import BookTableLink from "@/components/ui/BookTableLink";
import { site } from "@/data/site";

// This is a client component because the burger button and the menu it opens sit in
// different places in the document — the button is the last child of the header, the
// menu is the header's next sibling — so the smallest boundary that can hold the shared
// open state is the header itself. Its own content is static.
interface SiteHeaderProps {
  /** The rating badge, rendered on the server and slotted between the logo and the Instagram link. */
  rating?: ReactNode;
}

export default function SiteHeader({ rating }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  // Opening the menu inserts it above the content, and the browser shifts the scroll
  // position to keep what you were looking at still. Holding the page prevents the
  // browser from undoing that shift when the menu closes again, so the position is
  // recorded on the way in and put back on the way out. A link closes the menu without
  // restoring, because following the link is meant to move the page.
  const scrollBeforeOpen = useRef(0);

  const toggle = () => {
    if (open) {
      const restoreTo = scrollBeforeOpen.current;
      setOpen(false);
      requestAnimationFrame(() => {
        window.scrollTo({ top: restoreTo, behavior: "instant" });
      });
    } else {
      scrollBeforeOpen.current = window.scrollY;
      setOpen(true);
    }
  };

  return (
    <>
      <header className="nav" id="top">
        <a className="nav__brand" href="#top" aria-label="Zuki's Caffetteria — home">
          <Image
            src={logo}
            alt="Zuki's Caffetteria"
            className="nav__logo"
            priority
            sizes="64px"
          />
          <span className="nav__brand-text" aria-hidden="true">
            <span className="nav__brand-name">{"Zuki's"}</span>
            <span className="nav__brand-sub">Italian & Turkish</span>
          </span>
        </a>

        {rating}

        <a
          className="nav__social"
          href={site.social.instagram}
          target="_blank"
          rel="noopener"
          aria-label="Zuki's Caffetteria on Instagram"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="nav__social-icon">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm4.5 5.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"
            />
            <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
          </svg>
          <span className="nav__social-handle" aria-hidden="true">
            @zukiscaffetteria
          </span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          <a href="#story">Story</a>
          <a href="#menu">Menu</a>
          <a href="#gallery">Gallery</a>
          <a href="#visit">Visit</a>
        </nav>

        <BookTableLink className="btn btn--small">
          <span className="btn__dot" aria-hidden="true"></span> Book a table
        </BookTableLink>

        <button
          className="nav__toggle"
          id="navToggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={toggle}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      <MobileMenu open={open} onNavigate={() => setOpen(false)} />
    </>
  );
}
