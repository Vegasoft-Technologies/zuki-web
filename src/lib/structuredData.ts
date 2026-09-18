import { site } from "@/data/site";

/**
 * Builds the CafeOrCoffeeShop JSON-LD object from the same data the page renders, so
 * the structured data can never drift from what a visitor sees.
 */
export function buildStructuredData(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: site.name,
  };
}
