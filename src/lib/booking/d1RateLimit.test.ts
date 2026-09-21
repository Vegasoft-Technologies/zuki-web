import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { after, before, beforeEach, test } from "node:test";
import { getPlatformProxy } from "wrangler";
import { D1RateLimiter } from "./d1RateLimit.ts";
import type { D1Like } from "./d1Store.ts";

// The limiter against a real, local D1 database with the production migrations applied.
interface ExecD1 extends D1Like {
  exec(sql: string): Promise<unknown>;
}

let proxy: Awaited<ReturnType<typeof getPlatformProxy<{ DB: ExecD1 }>>>;
let db: ExecD1;

before(async () => {
  proxy = await getPlatformProxy<{ DB: ExecD1 }>({
    configPath: "wrangler.jsonc",
    persist: false,
  });
  db = proxy.env.DB;
  const dir = path.resolve("migrations");
  for (const file of (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort()) {
    const sql = await readFile(path.join(dir, file), "utf8");
    await db.exec(
      sql
        .split("\n")
        .filter((line) => line.trim() && !line.trim().startsWith("--"))
        .map((line) => line.replace(/--.*$/, ""))
        .join(" ")
        .replace(/;\s*/g, ";\n"),
    );
  }
});

after(async () => {
  await proxy.dispose();
});

beforeEach(async () => {
  await db.exec("DELETE FROM rate_limit_hits;");
});

const start = Date.parse("2026-09-21T09:00:00Z");
const WINDOW = 10 * 60_000;

test("the sixth request in the window is refused and the address recovers after it", async () => {
  const limiter = new D1RateLimiter(db, 5, WINDOW);
  for (let i = 0; i < 5; i++)
    assert.equal(await limiter.allow("203.0.113.10", start + i * 1000), true);
  assert.equal(await limiter.allow("203.0.113.10", start + 5_000), false);
  assert.equal(await limiter.allow("203.0.113.10", start + 9 * 60_000), false);
  assert.equal(await limiter.allow("203.0.113.10", start + WINDOW + 1), true);
});

test("another address is unaffected", async () => {
  const limiter = new D1RateLimiter(db, 5, WINDOW);
  for (let i = 0; i < 6; i++) await limiter.allow("203.0.113.10", start + i * 1000);
  assert.equal(await limiter.allow("198.51.100.7", start + 6_000), true);
});

test("twenty simultaneous requests from one address: exactly five pass", async () => {
  const limiter = new D1RateLimiter(db, 5, WINDOW);
  const results = await Promise.all(
    Array.from({ length: 20 }, (_, i) => limiter.allow("203.0.113.10", start + i)),
  );
  assert.equal(results.filter(Boolean).length, 5);
});

test("rows outside the window are removed as new ones are written", async () => {
  const limiter = new D1RateLimiter(db, 5, WINDOW);
  for (let i = 0; i < 5; i++) await limiter.allow("203.0.113.10", start + i);
  await limiter.allow("203.0.113.10", start + WINDOW + 5_000);
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM rate_limit_hits WHERE address = ?1")
    .bind("203.0.113.10")
    .first<{ n: number }>();
  assert.equal(row?.n, 1);
});
