import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  confirmationMode,
  maxBodyBytes,
  provisionalRules,
  rateLimitRules,
} from "./config.ts";
import { D1RateLimiter } from "./d1RateLimit.ts";
import { D1BookingStore, type D1Like } from "./d1Store.ts";
import { type Deps, edgeAddress, forwardedAddress } from "./handlers.ts";
import { LogNotifier } from "./notifier.ts";
import { MemoryRateLimiter, type RateLimiter } from "./rateLimit.ts";
import { type BookingStore, InMemoryBookingStore } from "./store.ts";

/**
 * The D1 binding when running on Cloudflare, resolved on each call because the bindings
 * exist only inside a request. Null off Cloudflare (`next start` on a workstation), where
 * there are no bindings at all. On Cloudflare a missing binding is a configuration error
 * and is reported as one, never papered over.
 */
function database(): D1Like | null {
  let env: { DB?: D1Like } | undefined;
  try {
    env = getCloudflareContext().env as { DB?: D1Like };
  } catch {
    return null;
  }
  if (!env.DB) throw new Error("The D1 binding DB is missing from the Worker.");
  return env.DB;
}

let warned = false;
function warnOnce() {
  if (warned) return;
  warned = true;
  console.warn(
    "[booking] no Cloudflare bindings: bookings and the rate limit are held in memory only.",
  );
}

/** The store the endpoint writes to: D1 on Cloudflare, chosen on the first request. */
function liveStore(): BookingStore {
  let chosen: BookingStore | undefined;
  const store = (): BookingStore => {
    if (chosen) return chosen;
    const db = database();
    if (db) chosen = new D1BookingStore(db);
    else {
      warnOnce();
      chosen = new InMemoryBookingStore();
    }
    return chosen;
  };
  return {
    coversDuring: (date, startsAt, endsAt) =>
      store().coversDuring(date, startsAt, endsAt),
    reserve: (request, capacity) => store().reserve(request, capacity),
    list: (date) => store().list(date),
  };
}

/** The limiter, chosen the same way: counted in D1 on Cloudflare, in memory off it. */
function liveLimiter(): RateLimiter {
  let chosen: RateLimiter | undefined;
  const limiter = (): RateLimiter => {
    if (chosen) return chosen;
    const db = database();
    const windowMs = rateLimitRules.windowMinutes * 60_000;
    if (db) chosen = new D1RateLimiter(db, rateLimitRules.maxRequests, windowMs);
    else {
      warnOnce();
      chosen = new MemoryRateLimiter(rateLimitRules.maxRequests, windowMs);
    }
    return chosen;
  };
  return { allow: (key, now) => limiter().allow(key, now) };
}

/**
 * On Cloudflare the caller's address is what the edge reports and nothing else. Off it
 * there is no edge, so local development reads the forwarding header instead.
 */
function liveClientAddress(request: Request): string | null {
  return database() ? edgeAddress(request) : forwardedAddress(request);
}

/**
 * The services the live endpoint runs on. The store and the rate limiter are D1; the
 * notifier is still the logging one (see docs/decisions/0007).
 */
let shared: Deps | undefined;

export function defaultDeps(): Deps {
  shared ??= {
    store: liveStore(),
    notifier: new LogNotifier(),
    limiter: liveLimiter(),
    clientAddress: liveClientAddress,
    rules: provisionalRules,
    mode: confirmationMode(),
    maxBodyBytes,
  };
  return shared;
}
