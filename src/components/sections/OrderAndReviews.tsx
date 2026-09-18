import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";
import { site } from "@/data/site";

const links = [
  {
    modifier: "deliveroo",
    href: site.ordering.deliveroo,
    action: "Order on",
    name: "Deliveroo",
    path: "M5 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 5h2.2l.9 2H20a1 1 0 0 1 .96 1.28l-1.7 6A1 1 0 0 1 18.3 15H7.1l-.4 1.5h12.1v1.5H6a1 1 0 0 1-.96-1.28L6.5 12 4.3 6.5H3V5Z",
  },
  {
    modifier: "justeat",
    href: site.ordering.justEat,
    action: "Order on",
    name: "Just Eat",
    path: "M12 2 3 9v12h6v-7h6v7h6V9l-9-7Z",
  },
  {
    modifier: "tripadvisor",
    href: site.social.tripadvisor,
    action: "Review on",
    name: "Tripadvisor",
    path: "m12 4 2.4 5.3 5.6.5-4.3 3.8 1.3 5.6L12 21.4 6.9 19l1.3-5.6L4 9.8l5.6-.5L12 4Z",
  },
];

export default function OrderAndReviews() {
  return (
    <section className="order" id="order">
      <Reveal className="order__inner">
        <Eyebrow className="eyebrow--center">{"Can't make it in?"}</Eyebrow>
        <SectionTitle className="section-title--center">
          Snap a photo, grab a bite, tell the world.
        </SectionTitle>
        <p className="order__note">
          We deliver across Exeter through Deliveroo and Just Eat. Already been? A review
          on Tripadvisor makes our day.
        </p>

        <div className="order__btns">
          {links.map((link) => (
            <a
              key={link.modifier}
              className={`order-btn order-btn--${link.modifier}`}
              href={link.href}
              target="_blank"
              rel="noopener"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="order-btn__icon">
                <path fill="currentColor" d={link.path} />
              </svg>
              <span>
                {link.action} <strong>{link.name}</strong>
              </span>
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
