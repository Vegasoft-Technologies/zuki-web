import type { D1Like } from "./d1Store.ts";
import type { RateLimiter } from "./rateLimit.ts";

/**
 * The rate limit counted in D1, so that every Worker isolate sees the same tally. One
 * guarded INSERT decides and records in a single statement: the row is written only while
 * the address has fewer than `maxRequests` rows inside the window, and SQLite runs the
 * statement atomically, so a burst from one address cannot slip past the limit between a
 * read and a write. A refused request writes nothing, exactly as the in-memory version.
 *
 * D1 rather than KV because KV allows one write per second per key and is eventually
 * consistent; a limiter needs an exact, immediate count.
 */
export class D1RateLimiter implements RateLimiter {
  private readonly db: D1Like;
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(db: D1Like, maxRequests: number, windowMs: number) {
    this.db = db;
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async allow(key: string, now: number): Promise<boolean> {
    const since = now - this.windowMs;
    const result = await this.db
      .prepare(
        `INSERT INTO rate_limit_hits (address, at)
         SELECT ?1, ?2
         WHERE (SELECT COUNT(*) FROM rate_limit_hits WHERE address = ?1 AND at > ?3) < ?4`,
      )
      .bind(key, now, since, this.maxRequests)
      .run();
    if (result.meta.changes !== 1) return false;
    // Rows that have left the window are no longer needed; drop this address's as we go.
    await this.db
      .prepare(`DELETE FROM rate_limit_hits WHERE address = ?1 AND at <= ?2`)
      .bind(key, since)
      .run();
    return true;
  }
}
