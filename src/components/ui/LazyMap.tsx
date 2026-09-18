import { site } from "@/data/site";

/**
 * The map is a third-party embed, so it is never loaded until the visitor asks for it.
 * Until then only this placeholder is rendered.
 */
export default function LazyMap() {
  return (
    <div className="map-embed" id="mapEmbed" data-src={site.maps.embed}>
      <div className="map-embed__placeholder" id="mapPlaceholder">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"
          />
        </svg>
        <p>The map loads from Google Maps, which may set cookies.</p>
        <button className="btn btn--small btn--gold" id="mapLoadBtn" type="button">
          Show map
        </button>
        <a
          className="map-embed__link"
          href={site.maps.directions}
          target="_blank"
          rel="noopener"
        >
          Open in Google Maps instead →
        </a>
      </div>
    </div>
  );
}
