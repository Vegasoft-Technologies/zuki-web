import Image from "next/image";
import logo from "../../../public/images/logo.png";
import vegasoftLogo from "../../../public/images/vegasoft-logo.png";
import CurrentYear from "@/components/ui/CurrentYear";
import { site } from "@/data/site";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <Image
          src={logo}
          alt="Zuki's Caffetteria"
          className="footer__logo"
          loading="lazy"
          sizes="116px"
        />
        <p className="footer__tag">Italian & Turkish Caffetteria · Est. 2017 · Exeter</p>
        <nav className="footer__links" aria-label="Footer">
          <a href="#story">Story</a>
          <a href="#menu">Menu</a>
          <a href="#gallery">Gallery</a>
          <a href="#order">Order</a>
          <a href="#visit">Visit</a>
          <a href={site.social.instagram} target="_blank" rel="noopener">
            Instagram
          </a>
          <a href="/privacy">Privacy & cookies</a>
        </nav>
        <p className="footer__copy">
          © <CurrentYear />
          {" Zuki's Caffetteria. Made with espresso & çay."}
        </p>
      </div>

      <a
        className="vegasoft"
        href={site.builder.url}
        target="_blank"
        rel="noopener"
        aria-label={`Website designed and built by ${site.builder.name} — visit ${site.builder.domain}`}
      >
        <Image
          src={vegasoftLogo}
          alt=""
          className="vegasoft__logo"
          aria-hidden="true"
          loading="lazy"
          sizes="36px"
        />
        <span className="vegasoft__text">
          <span className="vegasoft__line">
            Designed & built by <strong>{site.builder.name}</strong>
          </span>
          <span className="vegasoft__sub">{`${site.builder.domain} →`}</span>
        </span>
      </a>
    </footer>
  );
}
