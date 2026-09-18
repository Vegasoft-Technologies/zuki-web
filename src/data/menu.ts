import type { MenuCategory } from "@/types/menu";

/**
 * Every item on the menu, transcribed from the production page.
 * Changing a price or an item must never require editing a component.
 */
export const menu: MenuCategory[] = [
  {
    id: "breakfast",
    label: "Breakfast & Brunch",
    groups: [
      {
        title: "Breakfast & Brunch",
        column: 1,
        items: [
          {
            name: "Traditional English",
            price: "£12.95",
            amount: 12.95,
            description:
              "2 bacon, 2 sausages, fried egg, hash brown, mushroom, tomato & baked beans. Served with toast.",
          },
          {
            name: "Vegan Breakfast",
            price: "£12.95",
            amount: 12.95,
            description:
              "2 vegan sausages, avocado, 2 hash browns, mushroom, tomato, baked beans, grilled spinach & hummus. Served with toast.",
            diet: ["vegan"],
          },
          {
            name: "Turkish",
            price: "£13.25",
            amount: 13.25,
            description:
              "Sucuk, fried egg, feta, halloumi, olives, honey, tomato & cucumber. Served with pitta, butter & jam.",
          },
          {
            name: "Italian",
            price: "£12.95",
            amount: 12.95,
            description:
              "Butter croissant, yoghurt with granola & fruit, toasted sourdough, honey, jam & butter. Choice of latte, cappuccino or freshly pressed orange juice.",
            diet: ["vegetarian"],
          },
          {
            name: "Dee's Favourite",
            price: "£12.95",
            amount: 12.95,
            description:
              "Mushroom & spinach, grilled halloumi, fried egg, falafel & hummus. Served with pitta.",
            diet: ["vegetarian"],
          },
          {
            name: "Avocado on Toast",
            price: "£11.95",
            amount: 11.95,
            description:
              "Avocado, feta & chilli flakes on toasted sourdough. Served with rocket & cherry tomatoes. Add 2 poached eggs £2.50.",
            diet: ["vegetarian"],
          },
          {
            name: "Avocado, Smoked Salmon & Poached Eggs",
            price: "£12.95",
            amount: 12.95,
            description:
              "Poached eggs, avocado & smoked salmon on toasted sourdough. Served with rocket & cherry tomatoes.",
          },
          {
            name: "Zuki's Favourite",
            price: "£11.75",
            amount: 11.75,
            description:
              "Avocado, grilled halloumi & two fried eggs on sourdough. Served with rocket & cherry tomatoes. Add bacon £2.75.",
            diet: ["vegetarian"],
          },
          {
            name: "Eggs Benedict",
            price: "£11.25",
            amount: 11.25,
            description:
              "Poached eggs with ham on sourdough, Hollandaise sauce. Served with rocket salad & cherry tomatoes.",
          },
          {
            name: "Eggs Royale",
            price: "£12.75",
            amount: 12.75,
            description:
              "Poached eggs with smoked salmon on sourdough, Hollandaise sauce. Served with rocket & cherry tomatoes.",
          },
          {
            name: "Eggs in Purgatory",
            price: "£10.95",
            amount: 10.95,
            description:
              "Italian poached eggs in rich tomato sauce with chilli & oregano. Served with garlic sourdough.",
            diet: ["vegetarian"],
          },
          {
            name: "Menemen",
            price: "£10.95",
            amount: 10.95,
            description:
              "Turkish scrambled eggs with tomato & pepper sauce. Served with pitta. Add sucuk £2.25.",
            diet: ["vegetarian"],
          },
        ],
      },
      {
        title: "Local favourite",
        column: 2,
        items: [
          {
            name: "Bacon or Sausage Bap",
            price: "£5.25",
            amount: 5.25,
          },
          {
            name: "Breakfast Bap",
            price: "£6.95",
            amount: 6.95,
            description: "Bacon, sausage, egg & hash brown.",
          },
          {
            name: "Vegan Bap",
            price: "£5.95",
            amount: 5.95,
            description: "Two vegan sausages & two hash browns.",
            diet: ["vegan"],
          },
          {
            name: "Eggs Your Way on Sourdough",
            price: "£7.95",
            amount: 7.95,
            description: "Poached, scrambled or fried.",
            diet: ["vegetarian"],
          },
          {
            name: "Ham & Cheese Omelette",
            price: "£10.95",
            amount: 10.95,
            description: "Served with side salad. Add chips £2.25.",
          },
          {
            name: "Spinach & Mushroom Omelette",
            price: "£11.25",
            amount: 11.25,
            description: "Served with side salad. Add chips £2.25.",
            diet: ["vegetarian"],
          },
        ],
      },
      {
        title: "Sides",
        column: 2,
        items: [
          {
            name: "French Fries",
            price: "£5.25",
            amount: 5.25,
          },
          {
            name: "Curly Fries",
            price: "£5.95",
            amount: 5.95,
          },
          {
            name: "Side Salad",
            price: "£4.95",
            amount: 4.95,
          },
          {
            name: "Turkish Olives",
            price: "£3.95",
            amount: 3.95,
            diet: ["vegetarian"],
          },
          {
            name: "Fried Halloumi",
            price: "£2.25",
            amount: 2.25,
          },
          {
            name: "Smoked Salmon",
            price: "£2.95",
            amount: 2.95,
          },
          {
            name: "Avocado",
            price: "£2.25",
            amount: 2.25,
          },
          {
            name: "Bacon / Sucuk",
            price: "£2.75",
            amount: 2.75,
          },
          {
            name: "Hash Brown / Egg / Sausage",
            price: "£1.25",
            amount: 1.25,
          },
          {
            name: "Extra Pitta Bread",
            price: "£1.95",
            amount: 1.95,
          },
        ],
      },
    ],
    feature: {
      title: "Turkish Breakfast Spread",
      description:
        "Feta, fried halloumi, tomato & cucumber, crispy feta pastry, Turkish sausage, fried eggs, menemen, olives, yoghurt, fruit, honey, jam & butter. Includes unlimited Turkish tea & pitta.",
      price: "for 2 · £29.95",
      priceAlt: "for 4 · £52.95",
    },
  },
  {
    id: "sharing",
    label: "Sharing & Plates",
    groups: [
      {
        title: "Bruschetta",
        column: 1,
        items: [
          {
            name: "Classica",
            price: "£7.95",
            amount: 7.95,
            description: "Cherry tomato, garlic, extra virgin olive oil & oregano.",
            diet: ["vegan"],
          },
          {
            name: "Tricolore",
            price: "£8.95",
            amount: 8.95,
            description: "Pesto, cherry tomato & burrata.",
            diet: ["vegetarian"],
          },
          {
            name: "Prosciutto",
            price: "£9.25",
            amount: 9.25,
            description: "Pesto, burrata cheese & Parma ham.",
          },
        ],
      },
      {
        title: "Meze & antipasti",
        column: 1,
        items: [
          {
            name: "Hummus & Pitta",
            price: "£5.95",
            amount: 5.95,
            diet: ["vegan"],
          },
          {
            name: "Halloumi & Sweet Chilli",
            price: "£6.75",
            amount: 6.75,
            diet: ["vegetarian"],
          },
          {
            name: "Sigara Börek",
            price: "£6.95",
            amount: 6.95,
            description:
              "Deep-fried filo pastry with feta & parsley. Served with garlic mayo.",
            diet: ["vegetarian"],
          },
          {
            name: "Falafel & Hummus",
            price: "£9.25",
            amount: 9.25,
            description: "Deep-fried chickpea balls & hummus. Served with salad & pitta.",
            diet: ["vegetarian"],
          },
          {
            name: "Arancini Bites",
            price: "£8.75",
            amount: 8.75,
            description:
              "Sicilian fried rice balls filled with ragù, peas & mozzarella. Served with a spicy tomato sauce.",
          },
          {
            name: "Caponata",
            price: "£9.95",
            amount: 9.95,
            description:
              "Slow-cooked aubergine in a rich tomato sauce with celery, onion, olives, capers & pine nuts. Served with sourdough.",
            diet: ["vegan"],
          },
          {
            name: "Calamari Fritti",
            price: "£9.25",
            amount: 9.25,
            description:
              "Salt & pepper crispy fried squid with tartare sauce & lemon. Large £11.95.",
          },
          {
            name: "Gamberoni Fritti",
            price: "£11.95",
            amount: 11.95,
            description: "Tempura king prawns served with garlic mayonnaise.",
          },
        ],
      },
      {
        title: "Sharing platters",
        column: 2,
        items: [
          {
            name: "Turkish Meze",
            price: "£13.95",
            amount: 13.95,
            description:
              "Hummus, fried feta pastry, Turkish sausage, feta, falafel, olives, tomato & cucumber. Served with pitta. For two £23.95.",
          },
          {
            name: "Vegetarian Platter",
            price: "£13.95",
            amount: 13.95,
            description:
              "Feta, halloumi, hummus, falafel, crispy feta pastry, bruschetta classica, tomato & cucumber. Served with pitta. For two £23.95.",
            diet: ["vegetarian"],
          },
          {
            name: "Italian Antipasto",
            price: "£28.95",
            amount: 28.95,
            description:
              "Italian cured meats, cheeses, whole burrata, arancini, two bruschetta classica, olives, sundried tomatoes & pesto dip. Served with focaccia. For two to share.",
          },
        ],
      },
      {
        title: "Salads",
        column: 2,
        items: [
          {
            name: "Burrata Salad",
            price: "£11.95",
            amount: 11.95,
            description:
              "Whole Pugliese burrata with 24-month Parma ham, rocket, cherry tomatoes, olive oil & Modena balsamic glaze.",
          },
          {
            name: "Mediterranean Salad",
            price: "£8.95",
            amount: 8.95,
            description:
              "Mixed leaves, tomato, cucumber, feta, red onion & olives. Add chicken £3.95.",
            diet: ["vegetarian"],
          },
          {
            name: "Avocado & Salmon",
            price: "£11.25",
            amount: 11.25,
            description:
              "Smoked salmon, avocado, rocket, cucumber, cherry tomatoes, red onion & balsamic glaze.",
          },
        ],
      },
    ],
  },
  {
    id: "mains",
    label: "Mains & Sandwiches",
    groups: [
      {
        title: "Signature mains",
        column: 1,
        items: [
          {
            name: "Chicken Shish",
            price: "£17.95",
            amount: 17.95,
            description:
              "Traditional Turkish marinated chicken served with salad, house fries & garlic mayonnaise. Add side salad, hummus & tortilla crisps +£3.95.",
          },
          {
            name: "Frittura Portofino",
            price: "£19.95",
            amount: 19.95,
            description:
              "Calamari, scampi, tempura king prawns & whitebait with crispy zucchini & carrot julienne, sweet chilli sauce, tartare sauce & side salad.",
          },
          {
            name: "Eggplant Parmigiana",
            price: "£16.25",
            amount: 16.25,
            description:
              "Layers of fried aubergine, tomato sauce, mozzarella & parmesan, oven-baked. Served with sourdough.",
            diet: ["vegetarian"],
          },
        ],
      },
      {
        title: "Panini · Focaccia · Baguette",
        column: 2,
        items: [
          {
            name: "Ham & Cheese",
            price: "£5.45",
            amount: 5.45,
          },
          {
            name: "Mozzarella, Tomato & Pesto",
            price: "£5.75",
            amount: 5.75,
            diet: ["vegetarian"],
          },
          {
            name: "Hummus & Grilled Veg",
            price: "£5.75",
            amount: 5.75,
            diet: ["vegan"],
          },
          {
            name: "Brie & Cranberry",
            price: "£5.25",
            amount: 5.25,
            diet: ["vegetarian"],
          },
          {
            name: "Avocado, Grilled Veg & Brie",
            price: "£5.75",
            amount: 5.75,
            diet: ["vegetarian"],
          },
          {
            name: "Parma Ham, Brie & Rocket",
            price: "£5.95",
            amount: 5.95,
          },
          {
            name: "Salame, Mozzarella & Rocket",
            price: "£5.95",
            amount: 5.95,
          },
          {
            name: "BLT",
            price: "£5.95",
            amount: 5.95,
          },
          {
            name: "Tuna, Mayo & Tomato",
            price: "£5.95",
            amount: 5.95,
          },
          {
            name: "Smoked Salmon, Rocket & Brie",
            price: "£6.75",
            amount: 6.75,
          },
        ],
      },
    ],
  },
  {
    id: "coffee",
    label: "Coffee & Sweets",
    groups: [
      {
        title: "Caffetteria",
        column: 1,
        items: [
          {
            name: "Espresso / Doppio",
            price: "£2.45 / £2.75",
            amount: 2.45,
          },
          {
            name: "Espresso Macchiato",
            price: "£2.65",
            amount: 2.65,
          },
          {
            name: "Espresso con Panna",
            price: "£2.65",
            amount: 2.65,
          },
          {
            name: "Cortado",
            price: "£3.25",
            amount: 3.25,
          },
          {
            name: "Americano",
            price: "£3.40",
            amount: 3.4,
          },
          {
            name: "Cappuccino",
            price: "£3.55",
            amount: 3.55,
          },
          {
            name: "Latte",
            price: "£3.55",
            amount: 3.55,
          },
          {
            name: "Flat White",
            price: "£3.60",
            amount: 3.6,
          },
          {
            name: "Mocha",
            price: "£3.75",
            amount: 3.75,
          },
          {
            name: "Turkish Coffee",
            price: "£3.25",
            amount: 3.25,
          },
        ],
        fineprint: "Alt milk +30p · Extra shot +60p · Syrup +50p · Decaf available.",
      },
      {
        title: "Speciali",
        column: 1,
        items: [
          {
            name: "Chai Latte",
            price: "£3.75",
            amount: 3.75,
          },
          {
            name: "Turmeric Latte",
            price: "£3.75",
            amount: 3.75,
          },
          {
            name: "Matcha Latte",
            price: "£3.75",
            amount: 3.75,
          },
          {
            name: "Dirty Chai Latte",
            price: "£4.25",
            amount: 4.25,
          },
        ],
      },
      {
        title: "Hot chocolate & tea",
        column: 1,
        items: [
          {
            name: "Hot Chocolate",
            price: "£3.55",
            amount: 3.55,
          },
          {
            name: "Italian Hot Chocolate",
            price: "£4.25",
            amount: 4.25,
          },
          {
            name: "Chai Hot Chocolate",
            price: "£4.45",
            amount: 4.45,
          },
          {
            name: "English Breakfast / Herbal Tea",
            price: "£2.65",
            amount: 2.65,
          },
          {
            name: "Turkish Tea",
            price: "£2.20",
            amount: 2.2,
          },
        ],
      },
      {
        title: "Italian favourites",
        column: 2,
        items: [
          {
            name: "Pistachio Macchiato",
            price: "£4.95",
            amount: 4.95,
            description:
              "Pistachio cream, steamed milk, whipped cream & crushed pistachios.",
          },
          {
            name: "Bicerin",
            price: "£4.95",
            amount: 4.95,
            description:
              "Turin coffee: double espresso, rich hot chocolate & whipped cream.",
          },
          {
            name: "Affogato",
            price: "£5.95",
            amount: 5.95,
            description: "Vanilla artisan gelato & a double espresso shot.",
          },
        ],
      },
      {
        title: "Iced drinks",
        column: 2,
        items: [
          {
            name: "Iced Americano",
            price: "£3.90 / £4.20",
            amount: 3.9,
          },
          {
            name: "Iced Latte",
            price: "£4.10 / £4.60",
            amount: 4.1,
          },
          {
            name: "Iced Matcha",
            price: "£4.55 / £5.45",
            amount: 4.55,
          },
          {
            name: "Iced Chai Latte",
            price: "£4.95 / £5.65",
            amount: 4.95,
          },
          {
            name: "Iced Pistachio Latte",
            price: "£4.95 / £5.65",
            amount: 4.95,
          },
          {
            name: "Espresso Sunrise",
            price: "£5.25 / £5.95",
            amount: 5.25,
            description: "Fresh orange juice & espresso.",
          },
        ],
        hint: "reg / large",
      },
      {
        title: "Cannoli, cakes & pastries",
        column: 2,
        items: [
          {
            name: "Fresh Filled Sicilian Cannoli",
            price: "£2.95",
            amount: 2.95,
            description:
              "Pistachio, Biscoff or choco chips. 2 for £5 · 3 for £7. Gluten-free £2.25.",
          },
          {
            name: "Aragostine",
            price: "£1.85",
            amount: 1.85,
            description: "Hazelnut, pistachio or lemon. 3 for £5.95.",
          },
          {
            name: "Tiramisu",
            price: "£4.25",
            amount: 4.25,
            description: "Mascarpone, coffee & ladyfinger biscuits.",
          },
          {
            name: "Torta della Nonna",
            price: "£3.75",
            amount: 3.75,
            description: "Custard tart with pine nuts.",
          },
          {
            name: "Traditional Baklava",
            price: "£3.45",
            amount: 3.45,
            description: "Turkish pastry with pistachio · 2 pcs.",
          },
          {
            name: "Butter Croissant",
            price: "£2.25",
            amount: 2.25,
            description: "With butter & jam. Filled (pistachio / Nutella) £2.95.",
          },
        ],
      },
    ],
  },
  {
    id: "gelato",
    label: "Gelato",
    groups: [
      {
        title: "Gelato & sorbet",
        column: 1,
        items: [
          {
            name: "Classic",
            description: "Vanilla · Chocolate · Strawberry · Pistachio",
          },
          {
            name: "Special",
            description:
              "Raspberry Ripple · Stracciatella · Cherry Amarena · Ferrero Rocher",
          },
          {
            name: "Sorbet",
            description: "Raspberry · Blood Orange · Lemon · Wild Cherry",
            diet: ["vegan"],
          },
        ],
        hint: "1 · £3.90 / 2 · £5.20 / 3 · £6.20",
        compact: true,
      },
      {
        title: "Make it yours",
        column: 1,
        items: [
          {
            name: "Sprinkles & inclusions",
            price: "+£0.50",
            amount: 0.5,
            description: "Sprinkles, cookie crumble, choco chips or chopped pistachio.",
          },
          {
            name: "Sauces",
            price: "+£0.50",
            amount: 0.5,
            description: "Caramel, strawberry, raspberry, pistachio or chocolate.",
          },
          {
            name: "Fabbri Cherry Amarena",
            price: "+£1.80",
            amount: 1.8,
            description: "Cherry & syrup.",
          },
          {
            name: "Special cones",
            price: "+£0.50",
            amount: 0.5,
            description: "Waffle cone +£0.50 · dipped cone +£0.90.",
          },
          {
            name: "Whipped cream / wafer biscuits",
            price: "+£0.60",
            amount: 0.6,
          },
        ],
      },
      {
        title: "Sundaes",
        column: 2,
        items: [
          {
            name: "Chocolate",
            description: "Vanilla & chocolate gelato, chocolate sauce & whipped cream.",
          },
          {
            name: "Strawberry",
            description:
              "Strawberry sorbet, vanilla gelato, fresh strawberries, whipped cream & pistachios.",
          },
          {
            name: "Cheesecake",
            description:
              "Cheesecake gelato with your choice of sauce, biscuit crumble & whipped cream.",
          },
          {
            name: "Affogato",
            description: "Three scoops of gelato, two espresso shots & wafer biscuits.",
          },
        ],
        hint: "£8.90 in / £7.60 takeaway",
      },
      {
        title: "Treats",
        column: 2,
        items: [
          {
            name: "Gelato Croissant",
            price: "£7.20",
            amount: 7.2,
            description: "Warm croissant with two scoops, sauce & sprinkles included.",
          },
          {
            name: "Milkshakes",
            price: "£6.50 / £5.85",
            amount: 5.85,
            description: "Any gelato flavour. Eat in / takeaway.",
          },
          {
            name: "Add gelato to any cake",
            price: "+£3.20",
            amount: 3.2,
            description: "Choose any flavour.",
          },
        ],
      },
    ],
    note: "Authentic Italian artisan gelato, handmade daily in small batches using fresh British milk & cream. Flavours change daily — ask about today's specials.",
  },
  {
    id: "drinks",
    label: "Drinks",
    groups: [
      {
        title: "Wine",
        column: 1,
        items: [
          {
            name: "Pinot Grigio DOC",
            price: "£5 / £7 / £25",
            amount: 5.0,
            description: "Veneto, Italy. Fresh, crisp & citrusy.",
          },
          {
            name: "Chardonnay IGT",
            price: "£6 / £8 / £28",
            amount: 6.0,
            description: "Veneto, Italy. Soft tropical fruit, smooth finish.",
          },
          {
            name: "Sangiovese IGT",
            price: "£7 / £9 / £35",
            amount: 7.0,
            description: "Puglia, Italy. Medium-bodied, red berry notes.",
          },
        ],
        hint: "125ml / 175ml / bottle",
        fineprint: "Mini bottles: Pinot Grigio £6.95 · Merlot £7.50 · Prosecco £8.50.",
      },
      {
        title: "Beer & cider",
        column: 1,
        items: [
          {
            name: "Birra Moretti",
            price: "£5.25",
            amount: 5.25,
          },
          {
            name: "Efes Draft",
            price: "£5.95",
            amount: 5.95,
          },
          {
            name: "Nastro Azzurro / Corona",
            price: "£4.95",
            amount: 4.95,
          },
          {
            name: "Peroni 0.0",
            price: "£4.50",
            amount: 4.5,
            badge: "0%",
          },
          {
            name: "Rekorderlig Cider",
            price: "£4.95",
            amount: 4.95,
          },
        ],
      },
      {
        title: "Smoothies",
        column: 1,
        items: [
          {
            name: "Green",
            description: "Spinach, banana, apple & ginger.",
          },
          {
            name: "Tropical",
            description: "Pineapple, mango, banana & orange juice.",
          },
          {
            name: "Pina Colada",
            description: "Pineapple, banana & coconut milk.",
          },
          {
            name: "Berries Bliss",
            description: "Mixed berries, banana, yoghurt & honey.",
          },
        ],
        hint: "reg £5.65 / large £6.95",
        compact: true,
      },
      {
        title: "Spritz & cocktails",
        column: 2,
        items: [
          {
            name: "Aperol Spritz",
            price: "£9",
            amount: 9.0,
            description: "Aperol, prosecco & soda.",
          },
          {
            name: "Hugo Spritz",
            price: "£9",
            amount: 9.0,
            description: "Elderflower, prosecco & soda.",
          },
          {
            name: "Classic Bellini",
            price: "£7.95",
            amount: 7.95,
            description: "Peach purée & prosecco.",
          },
          {
            name: "Mimosa",
            price: "£7.95",
            amount: 7.95,
            description: "Fresh orange juice & prosecco.",
          },
          {
            name: "Elderflower Bellini",
            price: "£7.95",
            amount: 7.95,
            description: "Elderflower & prosecco.",
          },
          {
            name: "Virgin Hugo",
            price: "£6.50",
            amount: 6.5,
            description: "Lemon, mint, elderflower syrup & soda.",
            badge: "0%",
          },
        ],
      },
      {
        title: "Soft drinks & juice",
        column: 2,
        items: [
          {
            name: "Fresh Orange Juice",
            price: "£4.95 / £6.20",
            amount: 4.95,
            description: "Freshly pressed to order.",
          },
          {
            name: "San Pellegrino",
            price: "£2.65",
            amount: 2.65,
            description: "Lemon, orange, blood orange or orange pomegranate.",
          },
          {
            name: "Chinotto",
            price: "£2.65",
            amount: 2.65,
            description: "Bitter orange soft drink.",
          },
          {
            name: "Ginger Beer",
            price: "£4.50",
            amount: 4.5,
          },
          {
            name: "Coca-Cola / Diet / Rio Tropical",
            price: "£2.50",
            amount: 2.5,
          },
          {
            name: "Peach / Apple Juice",
            price: "£3.25",
            amount: 3.25,
          },
          {
            name: "Water",
            price: "£1.45 / £1.75",
            amount: 1.45,
            description: "Still / sparkling.",
          },
        ],
      },
    ],
  },
];

/** Printed once under the whole menu. */
export const menuAllergyNote =
  "Please let us know about any allergies or dietary needs — due to our small kitchen, traces of allergens may be present. Customers catching trains should allow at least 15 minutes during busy periods.";
