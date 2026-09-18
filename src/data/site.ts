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
  },
  telephone: "+441392666999",
  geo: {
    latitude: 50.7259,
    longitude: -3.5318,
  },
  social: {
    instagram: "",
    facebook: "",
    tripadvisor: "",
  },
  ordering: {
    deliveroo: "",
    justEat: "",
  },
} as const;
