import type { StaticImageData } from "next/image";
import imgInterior from "../../public/images/interior.jpg";
import imgGallery07 from "../../public/images/gallery-07.jpg";
import imgGallery14 from "../../public/images/gallery-14.jpg";
import imgGallery06 from "../../public/images/gallery-06.jpg";
import imgTurkishBreakfast from "../../public/images/turkish-breakfast.jpg";
import imgGallery12 from "../../public/images/gallery-12.jpg";
import imgGallery15 from "../../public/images/gallery-15.jpg";
import imgGallery10 from "../../public/images/gallery-10.jpg";
import imgGallery17 from "../../public/images/gallery-17.jpg";
import imgGallery04 from "../../public/images/gallery-04.jpg";
import imgGallery20 from "../../public/images/gallery-20.jpg";
import imgGallery05 from "../../public/images/gallery-05.jpg";
import imgGallery11 from "../../public/images/gallery-11.jpg";
import imgGallery08 from "../../public/images/gallery-08.jpg";
import imgGallery18 from "../../public/images/gallery-18.jpg";
import imgGallery23 from "../../public/images/gallery-23.jpg";
import imgGallery09 from "../../public/images/gallery-09.jpg";
import imgGallery13 from "../../public/images/gallery-13.jpg";
import imgGallery22 from "../../public/images/gallery-22.jpg";
import imgGallery16 from "../../public/images/gallery-16.jpg";
import imgGallery19 from "../../public/images/gallery-19.jpg";
import imgGallery21 from "../../public/images/gallery-21.jpg";

export type GalleryVariant = "tall" | "wide";

export interface GalleryImage {
  src: StaticImageData;
  alt: string;
  caption: string;
  /** The grid modifier the stylesheet uses to size the tile. */
  variant?: GalleryVariant;
}

export const gallery: GalleryImage[] = [
  {
    src: imgInterior,
    alt: "The flower-covered interior of Zuki's Caffetteria",
    caption: "Our flowered room",
    variant: "tall",
  },
  {
    src: imgGallery07,
    alt: "Traditional Turkish coffee served in an ornate cup",
    caption: "Turkish coffee",
  },
  {
    src: imgGallery14,
    alt: "Lotus Biscoff cheesecake with caramel sauce",
    caption: "Biscoff cheesecake",
    variant: "tall",
  },
  {
    src: imgGallery06,
    alt: "Zuki's Caffetteria storefront on Queen Street, Exeter",
    caption: "Find us on Queen Street",
    variant: "wide",
  },
  {
    src: imgTurkishBreakfast,
    alt: "Turkish breakfast spread with sucuk, cheese and olives",
    caption: "Turkish breakfast",
  },
  {
    src: imgGallery12,
    alt: "A board of freshly filled Sicilian cannoli",
    caption: "Sicilian cannoli",
  },
  {
    src: imgGallery15,
    alt: "Pistachio cream croissant dusted with sugar",
    caption: "Pistachio croissant",
    variant: "wide",
  },
  {
    src: imgGallery10,
    alt: "Freshly baked Turkish pide",
    caption: "Fresh pide",
    variant: "tall",
  },
  {
    src: imgGallery17,
    alt: "Bruschetta served with espresso",
    caption: "Bruschetta & espresso",
  },
  {
    src: imgGallery04,
    alt: "Pinsa topped with Parma ham and rocket",
    caption: "Parma & rocket",
  },
  {
    src: imgGallery20,
    alt: "Pistachio-topped bomboloni",
    caption: "Pistachio treats",
    variant: "tall",
  },
  {
    src: imgGallery05,
    alt: "A Turkish breakfast plate with sucuk, feta and olives",
    caption: "A Turkish plate",
    variant: "wide",
  },
  { src: imgGallery11, alt: "Espresso cups at the bar", caption: "At the bar" },
  { src: imgGallery08, alt: "Tiramisu served in glasses", caption: "Tiramisu" },
  {
    src: imgGallery18,
    alt: "Filled croissant sandwiches",
    caption: "Filled croissants",
    variant: "tall",
  },
  {
    src: imgGallery23,
    alt: "Freshly baked cookies",
    caption: "Fresh cookies",
    variant: "wide",
  },
  {
    src: imgGallery09,
    alt: "An aperitivo board with drinks and fresh fruit",
    caption: "Aperitivo, our way",
  },
  {
    src: imgGallery13,
    alt: "A basket of fresh pastries at the counter",
    caption: "Fresh this morning",
  },
  {
    src: imgGallery22,
    alt: "Sugar-dusted fried pastries",
    caption: "Sweet & dusted",
    variant: "tall",
  },
  {
    src: imgGallery16,
    alt: "A tray of assorted cannoli and pastries",
    caption: "Freshly filled",
    variant: "wide",
  },
  {
    src: imgGallery19,
    alt: "Tiramisu cups served with coffee",
    caption: "Coffee & cream",
  },
  {
    src: imgGallery21,
    alt: "Freshly made pistachio pastries presented by hand",
    caption: "Made fresh daily",
  },
];
