"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getConsent,
  getServerConsent,
  recordConsent,
  subscribe,
  type Consent,
} from "@/lib/consent";

export default function CookieBanner() {
  const consent = useSyncExternalStore(subscribe, getConsent, getServerConsent);
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  // The element is always in the markup and starts hidden, as it does in the original.
  // On the server `consent` is "unknown", so it stays hidden and nothing about the
  // visitor is assumed.
  const present = consent === "none" || dismissing;

  // A short delay before revealing, so the slide-in transition has a starting point.
  useEffect(() => {
    if (consent !== "none") return;
    const timer = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(timer);
  }, [consent]);

  const choose = (choice: Consent) => {
    setVisible(false);
    setDismissing(true);
    recordConsent(choice);
    // Matches the length of the slide-out transition in the stylesheet.
    setTimeout(() => setDismissing(false), 450);
  };

  return (
    <div
      className={visible ? "cookie is-visible" : "cookie"}
      id="cookie"
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      hidden={!present}
    >
      <div className="cookie__inner">
        <p className="cookie__text">
          We use essential cookies to run this site, and — only if you allow — Google Maps
          to show you where we are and Microsoft Clarity to see how the site is used. See
          our <a href="/privacy">Privacy & Cookie Policy</a>.
        </p>
        <div className="cookie__actions">
          <button
            className="btn btn--small btn--ghost-dark"
            type="button"
            data-cookie="essential"
            onClick={() => choose("essential")}
          >
            Essential only
          </button>
          <button
            className="btn btn--small btn--gold"
            type="button"
            data-cookie="all"
            onClick={() => choose("all")}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
