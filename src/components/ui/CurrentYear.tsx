"use client";

import { useSyncExternalStore } from "react";

/**
 * The year in the footer copyright line.
 *
 * It is read in the browser rather than on the server for the same reason the opening
 * status is: the value depends on the clock. Baking it into the statically built page
 * would freeze it and let it quietly go stale every January.
 *
 * Only the year is deferred. The sentence around it is server-rendered, so the footer
 * never appears with missing text.
 */
let cached: string | null = null;

/** Nothing to subscribe to: the year does not change while the page is open. */
function subscribe(): () => void {
  return () => {};
}

function getYear(): string {
  // Cached so that the value is stable between renders, as the hook requires.
  cached ??= String(new Date().getFullYear());
  return cached;
}

function getServerYear(): string {
  return "";
}

export default function CurrentYear() {
  const year = useSyncExternalStore(subscribe, getYear, getServerYear);
  return <span id="year">{year}</span>;
}
