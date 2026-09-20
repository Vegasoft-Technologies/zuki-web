/**
 * Limits how often one address may call the endpoint. This in-memory version is correct
 * for a single process and wrong across several, so the production limiter is chosen
 * with hosting; the interface is what the handler depends on.
 */
export interface RateLimiter {
  /** True if the request may proceed; false if the address has used its allowance. */
  allow(key: string, now: number): boolean;
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
