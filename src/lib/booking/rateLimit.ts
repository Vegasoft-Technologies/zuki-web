/**
 * Limits how often one address may call the endpoint. This in-memory version is correct
 * for a single process and wrong across several: on Workers each isolate would keep its
 * own tally and the limit would never trigger. Production uses the D1 version
 * (`d1RateLimit.ts`); this one serves the tests and local development. The handler
 * depends only on the interface.
 */
export interface RateLimiter {
  /** True if the request may proceed; false if the address has used its allowance. */
  allow(key: string, now: number): boolean | Promise<boolean>;
}

export class MemoryRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, number[]>();

  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  allow(key: string, now: number): boolean {
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (recent.length >= this.maxRequests) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }
}
