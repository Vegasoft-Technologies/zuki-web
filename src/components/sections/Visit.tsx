import Eyebrow from "@/components/ui/Eyebrow";
import SectionTitle from "@/components/ui/SectionTitle";
import LazyMap from "@/components/ui/LazyMap";
import { site } from "@/data/site";
import OpeningHoursTable from "@/components/ui/OpeningHoursTable";

export default function Visit() {
  return (
    <section className="visit" id="visit">
      <div className="visit__canopy" aria-hidden="true"></div>
      <div className="visit__grid">
        <div className="visit__info reveal">
          <Eyebrow>Come and see us</Eyebrow>
          <SectionTitle>Find your seat under the flowers.</SectionTitle>

          <div className="visit__block">
            <h3>Where</h3>
            <p>
              {site.address.street}
              <br />
              {`${site.address.locality} ${site.address.postcode}`}
              <br />
              {site.address.country}
            </p>
            <p className="visit__hint">
              Right next to Exeter Central Station — perfect for a coffee before your
              train.
            </p>
            <a
              className="link-arrow"
              href={site.maps.directions}
              target="_blank"
              rel="noopener"
            >
              Get directions →
            </a>
          </div>

          <div className="visit__block">
            <h3>Get in touch</h3>
            <p>
              <a href={`tel:${site.telephone}`}>{site.telephoneDisplay}</a>
            </p>
            <p>
              <a href={site.social.instagram} target="_blank" rel="noopener">
                @zukiscaffetteria
              </a>
            </p>
          </div>

          <div className="visit__block">
            <h3>Opening hours</h3>
            <OpeningHoursTable />
          </div>
        </div>

        <div className="visit__map reveal">
          <LazyMap />
        </div>
      </div>
    </section>
  );
}
