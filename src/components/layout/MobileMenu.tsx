import { site } from "@/data/site";

export default function MobileMenu() {
  return (
    <div className="mobile-menu" id="mobileMenu" hidden>
      <a href="#story">Story</a>
      <a href="#menu">Menu</a>
      <a href="#gallery">Gallery</a>
      <a href="#visit">Visit</a>
      <a className="mobile-menu__call" href={`tel:${site.telephone}`}>
        Call {site.telephoneDisplay}
      </a>
    </div>
  );
}
