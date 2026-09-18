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
  telephoneDisplay: "+44 1392 666999",
  geo: {
    latitude: 50.7259,
    longitude: -3.5318,
  },
  social: {
    instagram: "https://www.instagram.com/zukiscaffetteria/",
    facebook: "",
    tripadvisor:
      "https://www.tripadvisor.co.uk/Restaurant_Review-g186254-d15840655-Reviews-Zukis_Caffetteria-Exeter_Devon_England.html",
  },
  ordering: {
    deliveroo: "https://deliveroo.co.uk/menu/exeter/exeter-city-centre/zukis-caffetteria",
    justEat: "https://www.just-eat.co.uk/restaurants-zukis-caffetteria-exeter/menu",
  },
} as const;
