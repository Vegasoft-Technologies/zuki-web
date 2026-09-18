import Image from "next/image";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionTitle from "@/components/ui/SectionTitle";
import { gallery } from "@/data/gallery";
import { site } from "@/data/site";

export default function Gallery() {
  return (
    <section className="gallery" id="gallery">
      <div className="gallery__head reveal">
        <Eyebrow className="eyebrow--center">A look around</Eyebrow>
        <SectionTitle className="section-title--center">
          From our table to yours
        </SectionTitle>
      </div>

      <div className="gallery__grid">
        {gallery.map((image) => (
          <figure
            key={image.caption}
            className={
              image.variant
                ? `gallery__item gallery__item--${image.variant} reveal`
                : "gallery__item reveal"
            }
            data-caption={image.caption}
          >
            <Image src={image.src} alt={image.alt} loading="lazy" />
            <figcaption>{image.caption}</figcaption>
          </figure>
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
