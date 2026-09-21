/**
 * The visitor's cookie choice, kept in localStorage and shared by the banner that asks
 * for it and the map that depends on it.
 *
 * It is exposed as an external store rather than as state in an effect, because
 * localStorage does not exist while the page is being rendered on the server.
 * `useSyncExternalStore` is built for exactly this: the server is told "unknown", the
 * browser reads the real value after hydration, and React re-renders once without a
 * mismatch.
 */
export type Consent = "all" | "essential";

/** "unknown" only ever appears in the server render, before localStorage can be read. */
export type ConsentState = Consent | "none" | "unknown";

const STORAGE_KEY = "zukis-consent";

const listeners = new Set<() => void>();
let cached: ConsentState = "unknown";
let hasRead = false;

function readStored(): ConsentState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "all" || stored === "essential" ? stored : "none";
  } catch {
    // Private browsing can make even reading localStorage throw. Behave as though no
    // choice has been recorded: the banner is shown and nothing is stored.
    return "none";
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Read in the browser. The result is cached so repeated renders stay stable. */
export function getConsent(): ConsentState {
  if (!hasRead) {
    cached = readStored();
    hasRead = true;
  }
  return cached;
}

/** Read during the server render, where there is no storage to consult. */
export function getServerConsent(): ConsentState {
  return "unknown";
}

export function recordConsent(choice: Consent): void {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Nothing can be stored, so the choice applies to this page view only.
  }
  cached = choice;
  hasRead = true;
  listeners.forEach((listener) => listener());
}

/** Forgets the choice, so the banner is shown again and nothing optional loads. */
export function clearConsent(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing was stored, or storage is unavailable; either way there is no choice left.
  }
  cached = "none";
  hasRead = true;
  listeners.forEach((listener) => listener());
}
