import { formatTime, openingHours } from "@/data/openingHours";
import { site } from "@/data/site";

/**
 * Groups the days that share opening times, so Monday to Friday is described once
 * rather than five times. The order follows `openingHours`, which runs Monday first.
 */
function openingHoursSpecification() {
  const grouped = new Map<string, string[]>();

  for (const day of openingHours) {
    const key = `${day.opens}-${day.closes}`;
    grouped.set(key, [...(grouped.get(key) ?? []), day.label]);
  }

  return [...grouped.entries()].map(([key, days]) => {
    const [opens, closes] = key.split("-").map(Number);
    return {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days.length === 1 ? days[0] : days,
      opens: formatTime(opens),
      closes: formatTime(closes),
    };
  });
}

/**
 * Builds the CafeOrCoffeeShop record from the same data the page renders, so the two
 * can never disagree.
 */
export function buildStructuredData(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: site.name,
    description:
      "Italian & Turkish caffetteria on Queen Street, Exeter. All-day breakfast, Turkish spreads, fresh cornetti, espresso and Turkish coffee.",
    image: `${site.url}/images/interior.jpg`,
    "@id": `${site.url}/`,
    url: `${site.url}/`,
    telephone: site.telephone,
    priceRange: "££",
    menu: `${site.url}/#menu`,
    hasMenu: `${site.url}/#menu`,
    servesCuisine: ["Italian", "Turkish", "Breakfast", "Brunch", "Coffee"],
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      postalCode: site.address.postcode,
      addressCountry: site.address.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    openingHoursSpecification: openingHoursSpecification(),
    acceptsReservations: "True",
    sameAs: [site.social.instagram, site.social.facebook, site.social.tripadvisor],
  };
}
