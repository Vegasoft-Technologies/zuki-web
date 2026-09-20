import Image from "next/image";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";
import { gallery } from "@/data/gallery";
import { site } from "@/data/site";

export default function Gallery() {
  return (
    <section className="gallery" id="gallery">
      <Reveal className="gallery__head">
        <Eyebrow className="eyebrow--center">A look around</Eyebrow>
        <SectionTitle className="section-title--center">
          From our table to yours
        </SectionTitle>
      </Reveal>

      <div className="gallery__grid">
        {gallery.map((image) => (
          <Reveal
            as="figure"
            key={image.caption}
            className={
              image.variant
                ? `gallery__item gallery__item--${image.variant}`
                : "gallery__item"
            }
            data-caption={image.caption}
          >
            <Image
              src={image.src}
              alt={image.alt}
              loading="lazy"
              sizes="(min-width: 921px) min(21vw, 251px), (min-width: 681px) 29vw, 44vw"
            />
            <figcaption>{image.caption}</figcaption>
          </Reveal>
        ))}
      </div>

      <p className="gallery__more">
        See more on{" "}
        <a href={site.social.instagram} target="_blank" rel="noopener">
          @zukiscaffetteria
        </a>
      </p>
    </section>
  );
}
