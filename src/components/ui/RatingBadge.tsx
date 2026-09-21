import { fetchRating, starFills } from "@/lib/rating";

// A five-pointed star on a 24-unit grid. The fill is a horizontal gradient that switches
// from gold to the empty colour at the given fraction of the star's width, so a rating of
// 4.6 shows a fifth star that is 60% gold. The gradient is defined per star and referenced
// by id, which is why each star carries one.
const STAR_POINTS =
  "12.00,0.50 14.82,8.12 22.94,8.45 16.57,13.48 18.76,21.30 12.00,16.80 5.24,21.30 7.43,13.48 1.06,8.45 9.18,8.12";

function Star({ id, fill }: { id: string; fill: number }) {
  const solid = fill <= 0 ? "var(--line)" : fill >= 1 ? "var(--gold)" : undefined;
  return (
    <svg className="rating-badge__star" viewBox="0 0 24 24" aria-hidden="true">
      {solid === undefined && (
        <defs>
          <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
            <stop offset={fill} style={{ stopColor: "var(--gold)" }} />
            <stop offset={fill} style={{ stopColor: "var(--line)" }} />
          </linearGradient>
        </defs>
      )}
      <polygon points={STAR_POINTS} style={{ fill: solid ?? `url(#${id})` }} />
    </svg>
  );
}

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
        <span className="rating-badge__stars">
          {starFills(rating.value).map((fill, i) => (
            <Star key={i} id={`rating-star-${i + 1}`} fill={fill} />
          ))}
        </span>
        {value}
      </span>
      <span className="rating-badge__meta" aria-hidden="true">
        {`${rating.count} reviews · ${rating.source}, ${updated}`}
      </span>
    </a>
  );
}
