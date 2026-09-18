"use client";

import { useState, useSyncExternalStore } from "react";
import { site } from "@/data/site";
import { getConsent, getServerConsent, subscribe } from "@/lib/consent";

/**
 * The map is a third-party embed from Google, so nothing is requested from it until
 * the visitor asks. Until then only the placeholder is rendered, and the stylesheet
 * hides that placeholder once the map has loaded.
 */
export default function LazyMap() {
  const [asked, setAsked] = useState(false);
  const consent = useSyncExternalStore(subscribe, getConsent, getServerConsent);

  // Either the visitor pressed the button, or they have already accepted everything.
  // On the server `consent` is "unknown", so nothing loads during the server render.
  const loaded = asked || consent === "all";

  return (
    <div
      className={loaded ? "map-embed is-loaded" : "map-embed"}
      id="mapEmbed"
      data-src={site.maps.embed}
    >
      <div className="map-embed__placeholder" id="mapPlaceholder">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"
          />
        </svg>
        <p>The map loads from Google Maps, which may set cookies.</p>
        <button
          className="btn btn--small btn--gold"
          id="mapLoadBtn"
          type="button"
          onClick={() => setAsked(true)}
        >
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

      {loaded ? (
        <iframe
          src={site.maps.embed}
          title="Map to Zuki's Caffetteria, 3B Queen Street, Exeter"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : null}
    </div>
  );
}
