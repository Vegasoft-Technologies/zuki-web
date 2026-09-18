import Image from "next/image";
import logo from "../../../public/images/logo.png";
import MobileMenu from "./MobileMenu";
import { site } from "@/data/site";

export default function SiteHeader() {
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
          aria-label="Open menu"
          aria-expanded="false"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      <MobileMenu />
    </>
  );
}
