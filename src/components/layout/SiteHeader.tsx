"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import MobileMenu from "./MobileMenu";
import { site } from "@/data/site";

// This is a client component because the burger button and the menu it opens sit in
// different places in the document — the button is the last child of the header, the
// menu is the header's next sibling — so the smallest boundary that can hold the shared
// open state is the header itself. Its own content is static.
export default function SiteHeader() {
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
          <Image src={logo} alt="Zuki's Caffetteria" className="nav__logo" priority />
          <span className="nav__brand-text" aria-hidden="true">
            <span className="nav__brand-name">{"Zuki's"}</span>
            <span className="nav__brand-sub">Italian & Turkish</span>
          </span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          <a href="#story">Story</a>
          <a href="#menu">Menu</a>
          <a href="#gallery">Gallery</a>
          <a href="#visit">Visit</a>
        </nav>

        <a className="btn btn--small" href={`tel:${site.telephone}`}>
          <span className="btn__dot" aria-hidden="true"></span> Book a table
        </a>

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
