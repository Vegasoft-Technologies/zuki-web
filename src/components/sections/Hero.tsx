import Image from "next/image";
import logo from "../../../public/images/logo.png";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import OpeningStatus from "@/components/ui/OpeningStatus";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__canopy" aria-hidden="true"></div>

      <Reveal className="hero__inner">
        <Image src={logo} alt="Zuki's Caffetteria" className="hero__logo" priority />
        <Eyebrow className="eyebrow--center">
          {"Est. 2017  ·  Queen Street, Exeter"}
        </Eyebrow>

        <h1 className="hero__title">
          Two coffee cultures,
          <br /> <em>one little garden</em> in Exeter.
        </h1>

        <p className="hero__lede">
          A moka pot on one side, a cezve on the other. Italian and Turkish, served side
          by side under a ceiling of flowers all-day breakfast, fresh cornetti, and cake
          worth the walk into town.
        </p>

        <div className="hero__actions">
          <Button href="#menu" className="btn--gold">
            See the menu
          </Button>
          <Button href="#visit" className="btn--ghost">
            Find us & opening hours
          </Button>
        </div>

        <OpeningStatus />
      </Reveal>
    </section>
  );
}
