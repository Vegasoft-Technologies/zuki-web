import { fetchRating } from "@/lib/rating";

/**
 * The rating beside the logo. A server component: it fetches on the server, and if
 * there is nothing to show it renders nothing at all, so its absence never leaves a
 * gap or breaks the header.
 */
export default async function RatingBadge() {
  const rating = await fetchRating();
  if (!rating) return null;

  const value = rating.value.toFixed(1);
  const updated = rating.fetchedAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <a
      className="rating-badge"
      href={rating.url}
      target="_blank"
      rel="noopener"
      aria-label={`Rated ${value} out of 5 from ${rating.count} reviews on ${rating.source}, updated ${updated}. Read the reviews.`}
    >
      <span className="rating-badge__value" aria-hidden="true">
        {value}
        <span className="rating-badge__star">★</span>
      </span>
      <span className="rating-badge__meta" aria-hidden="true">
        {`${rating.count} reviews · ${rating.source}, ${updated}`}
      </span>
    </a>
  );
}
