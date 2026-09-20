/**
 * The live rating shown in the header.
 *
 * Read on the server only. The key never reaches the browser, and the provider is never
 * called from it, which is what keeps the visitor's address away from a third party
 * before they have consented to anything. The result is cached and revalidated at most
 * once a day.
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

/** Pure. Turns a Place Details response into a rating, or null if it has none. */
export function parseRating(
  body: unknown,
  placeId: string,
  fetchedAt: Date,
): Rating | null {
  if (typeof body !== "object" || body === null) return null;
  const result = (body as { result?: unknown }).result;
  if (typeof result !== "object" || result === null) return null;
  const { rating, user_ratings_total: count } = result as {
    rating?: unknown;
    user_ratings_total?: unknown;
  };
  if (typeof rating !== "number" || typeof count !== "number") return null;
  if (!(rating >= 0 && rating <= 5) || !Number.isInteger(count) || count < 0) return null;
  return {
    value: rating,
    count,
    source: "Google",
    url: `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`,
    fetchedAt,
  };
}

export async function fetchRating(): Promise<Rating | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) return null;

  // Overridable so the badge can be exercised against a local stand-in in development
  // and tests. Production leaves it unset and talks to Google.
  const base = process.env.GOOGLE_PLACES_API_URL ?? "https://maps.googleapis.com";
  const url = new URL("/maps/api/place/details/json", base);
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "rating,user_ratings_total");
  url.searchParams.set("key", key);

  try {
    const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!response.ok) return null;
    return parseRating(await response.json(), placeId, new Date());
  } catch {
    return null;
  }
}
