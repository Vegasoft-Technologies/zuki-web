/**
 * The live rating shown in the header, from the Places API (New).
 *
 * Read on the server only. The key never reaches the browser, and the provider is never
 * called from it, which is what keeps the visitor's address away from a third party
 * before they have consented to anything. The result is cached and revalidated at most
 * once a day, so the provider is called once per build or revalidation, not per visitor.
 *
 * If the key or the place identifier is absent, or the request fails, the answer is
 * `null` and the badge renders nothing. A stale or invented figure is never shown.
 */
export interface Rating {
  /** Out of five. */
  value: number;
  count: number;
  /** Where the figure came from, shown beside it. */
  source: string;
  /** A page where the reviews can be read. */
  url: string;
  /** When the figure was fetched, shown beside it. */
  fetchedAt: Date;
}

const REVALIDATE_SECONDS = 60 * 60 * 24;

/**
 * Pure. Turns a Places API (New) place resource into a rating, or null if it has none.
 * The resource carries `rating`, `userRatingCount` and `googleMapsUri`.
 */
export function parseRating(
  body: unknown,
  placeId: string,
  fetchedAt: Date,
): Rating | null {
  if (typeof body !== "object" || body === null) return null;
  const {
    rating,
    userRatingCount: count,
    googleMapsUri,
  } = body as {
    rating?: unknown;
    userRatingCount?: unknown;
    googleMapsUri?: unknown;
  };
  if (typeof rating !== "number" || typeof count !== "number") return null;
  if (!(rating >= 0 && rating <= 5) || !Number.isInteger(count) || count < 0) return null;
  const url =
    typeof googleMapsUri === "string" && googleMapsUri.startsWith("https://")
      ? googleMapsUri
      : `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`;
  return { value: rating, count, source: "Google", url, fetchedAt };
}

/**
 * Pure. How much of each of the five stars is filled, 0 to 1, so that 4.6 draws four
 * full stars and a fifth that is 60% filled rather than a rounded-up fifth star. One
 * number drives each fill, so any rating renders in proportion.
 */
export function starFills(value: number): number[] {
  return [1, 2, 3, 4, 5].map((n) => {
    const fill = Math.min(1, Math.max(0, value - (n - 1)));
    return Math.round(fill * 100) / 100;
  });
}

export async function fetchRating(): Promise<Rating | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) return null;

  // Overridable so the badge can be exercised against a local stand-in in development
  // and tests. Production leaves it unset and talks to Google.
  const base = process.env.GOOGLE_PLACES_API_URL ?? "https://places.googleapis.com";
  const url = new URL(`/v1/places/${encodeURIComponent(placeId)}`, base);

  try {
    const response = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": key,
        // Only the three fields the badge needs; the field mask also keeps the call cheap.
        "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri",
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    return parseRating(await response.json(), placeId, new Date());
  } catch {
    return null;
  }
}
