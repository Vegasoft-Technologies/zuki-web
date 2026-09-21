import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  confirmationMode,
  maxBodyBytes,
  provisionalRules,
  rateLimitRules,
} from "./config.ts";
import { D1BookingStore, type D1Like } from "./d1Store.ts";
import type { Deps } from "./handlers.ts";
import { LogNotifier } from "./notifier.ts";
import { MemoryRateLimiter } from "./rateLimit.ts";
import { type BookingStore, InMemoryBookingStore } from "./store.ts";

/**
 * The store the endpoint writes to: D1 on Cloudflare, chosen on the first request rather
 * than when the module loads, because the bindings only exist inside a request. Off
 * Cloudflare (`next start` on a workstation) there are no bindings at all and the
 * in-memory store is used, with a warning, so the form still works locally. On Cloudflare
 * a missing binding is a configuration error and is reported as one, never papered over.
 */
function liveStore(): BookingStore {
  let chosen: BookingStore | undefined;
  const store = (): BookingStore => {
    if (chosen) return chosen;
    let env: { DB?: D1Like } | undefined;
    try {
      env = getCloudflareContext().env as { DB?: D1Like };
    } catch {
      env = undefined;
    }
    if (env) {
      if (!env.DB) throw new Error("The D1 binding DB is missing from the Worker.");
      chosen = new D1BookingStore(env.DB);
    } else {
      console.warn("[booking] no Cloudflare bindings: bookings are held in memory only.");
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

/**
 * The services the live endpoint runs on. The notifier and the rate limiter are still the
 * in-memory versions (see docs/decisions/0007); the store is D1.
 */
let shared: Deps | undefined;

export function defaultDeps(): Deps {
  shared ??= {
    store: liveStore(),
    notifier: new LogNotifier(),
    limiter: new MemoryRateLimiter(
      rateLimitRules.maxRequests,
      rateLimitRules.windowMinutes * 60_000,
    ),
    rules: provisionalRules,
    mode: confirmationMode(),
    maxBodyBytes,
  };
  return shared;
}
