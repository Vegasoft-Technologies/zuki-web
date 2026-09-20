import {
  confirmationMode,
  maxBodyBytes,
  provisionalRules,
  rateLimitRules,
} from "./config.ts";
import type { Deps } from "./handlers.ts";
import { LogNotifier } from "./notifier.ts";
import { MemoryRateLimiter } from "./rateLimit.ts";
import { InMemoryBookingStore } from "./store.ts";

/**
 * The services the live endpoint runs on today. The store, notifier and limiter are the
 * in-memory versions: correct on one process, reset when it restarts, and replaced by
 * their hosted counterparts once the platform is decided (see docs/decisions/0007).
 */
let shared: Deps | undefined;

export function defaultDeps(): Deps {
  shared ??= {
    store: new InMemoryBookingStore(),
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
