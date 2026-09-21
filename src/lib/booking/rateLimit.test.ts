import assert from "node:assert/strict";
import test from "node:test";
import { MemoryRateLimiter } from "./rateLimit.ts";

test("the limit triggers on the sixth request in the window and recovers when it passes", () => {
  const limiter = new MemoryRateLimiter(5, 10 * 60_000);
  const start = Date.parse("2026-09-21T09:00:00Z");
  for (let i = 0; i < 5; i++)
    assert.equal(limiter.allow("203.0.113.10", start + i * 1000), true);
  assert.equal(limiter.allow("203.0.113.10", start + 5_000), false);
  assert.equal(limiter.allow("203.0.113.10", start + 9 * 60_000), false); // still inside
  assert.equal(limiter.allow("203.0.113.10", start + 10 * 60_000 + 1), true); // recovered
  assert.equal(limiter.allow("198.51.100.7", start + 5_000), true); // another address
});
