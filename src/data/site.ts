/**
 * Single source of truth for values that appear in more than one place.
 * Nothing here may be duplicated into a component.
 */
export const site = {
  name: "Zuki's Caffetteria",
  url: "https://zukiscaffetteria.co.uk",
  address: {
    street: "3B Queen Street",
    locality: "Exeter",
    postcode: "EX4 3SB",
    country: "United Kingdom",
    /** ISO 3166-1 alpha-2, which is what schema.org expects. */
    countryCode: "GB",
  },
  telephone: "+441392666999",
  telephoneDisplay: "+44 1392 666999",
  geo: {
    latitude: 50.7259,
    longitude: -3.5318,
  },
  maps: {
    /** Opens Google Maps in a new tab. */
    directions:
      "https://www.google.com/maps/search/?api=1&query=Zuki%27s+Caffetteria+3B+Queen+St+Exeter+EX4+3SB",
    /** The embedded map, loaded only once the visitor asks for it. */
    embed:
      "https://maps.google.com/maps?q=Zuki's%20Caffetteria%203B%20Queen%20Street%20Exeter%20EX4%203SB&z=16&output=embed",
  },
  social: {
    instagram: "https://www.instagram.com/zukiscaffetteria/",
    // Note the handle differs from the Instagram one; this is what the business uses.
    facebook: "https://www.facebook.com/zukiscafetteria/",
    tripadvisor:
      "https://www.tripadvisor.co.uk/Restaurant_Review-g186254-d15840655-Reviews-Zukis_Caffetteria-Exeter_Devon_England.html",
  },
  /** The studio that builds and maintains the site. */
  builder: {
    name: "Vegasoft",
    url: "https://vegasoft.co.uk",
    domain: "vegasoft.co.uk",
  },
  ordering: {
    deliveroo: "https://deliveroo.co.uk/menu/exeter/exeter-city-centre/zukis-caffetteria",
    justEat: "https://www.just-eat.co.uk/restaurants-zukis-caffetteria-exeter/menu",
  },
} as const;
