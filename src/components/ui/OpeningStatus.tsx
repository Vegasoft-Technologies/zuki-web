"use client";

import { useEffect, useState } from "react";
import { getOpeningStatus, type OpeningStatus as Status } from "@/lib/openingStatus";

/**
 * The live "open now" line. The server has no idea what time it is where the visitor
 * is, and rendering a time there would not match what the browser computes a moment
 * later, so the element ships empty and is filled in an effect.
 */
export default function OpeningStatus() {
  const [status, setStatus] = useState<Status | null>(null);

  // Filled on the next frame rather than synchronously, so the first paint is not
  // blocked and no cascading render happens on mount.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setStatus(getOpeningStatus(new Date())));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <p className="hero__status" id="heroStatus" aria-live="polite">
      {status ? (
        <>
          <span className={status.isOpen ? "open" : "closed"}>
            {status.isOpen ? "Open now" : "Closed now"}
          </span>{" "}
          <span className="dot">·</span> {status.detail}
        </>
      ) : null}
    </p>
  );
}
