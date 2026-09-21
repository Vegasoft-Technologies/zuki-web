import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { after, before, beforeEach, test } from "node:test";
import { getPlatformProxy } from "wrangler";
import { bookingRules } from "./config.ts";
import { D1BookingStore, type D1Like } from "./d1Store.ts";
import { createBookingHandlers, forwardedAddress } from "./handlers.ts";
import { RecordingNotifier } from "./notifier.ts";
import { MemoryRateLimiter } from "./rateLimit.ts";
import { checkSlot } from "./slots.ts";
import type { ReserveRequest } from "./store.ts";

// Runs the store against a real, local D1 database from wrangler's runtime, with the
// schema applied from the same migration files production uses. Nothing is persisted.
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
    // D1's exec takes one statement per line, so comments and blank lines are dropped.
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
  await db.exec("DELETE FROM bookings;");
});

const NOW = new Date("2026-09-21T08:00:00Z"); // Monday 09:00 London

const slotAt = (time: string, date = "2026-09-22") => {
  const check = checkSlot(date, time, bookingRules, NOW);
  if (!check.ok) throw new Error(`bad slot ${date} ${time}: ${check.problem}`);
  return check.slot;
};

const party = (size: number, time = "12:00"): ReserveRequest => ({
  name: "Ada Lovelace",
  partySize: size,
  slot: slotAt(time),
  contact: { phone: "+44 1392 000000" },
  status: "confirmed",
});

test("a booking is stored and read back with the same fields", async () => {
  const store = new D1BookingStore(db);
  const result = await store.reserve({ ...party(2), note: "window seat" }, 12);
  assert.equal(result.ok, true);
  const [saved] = await store.list("2026-09-22");
  assert.equal(saved.name, "Ada Lovelace");
  assert.equal(saved.partySize, 2);
  assert.equal(saved.slot.time, "12:00");
  assert.equal(saved.slot.startsAt.toISOString(), slotAt("12:00").startsAt.toISOString());
  assert.deepEqual(saved.contact, { phone: "+44 1392 000000" });
  assert.equal(saved.note, "window seat");
  assert.equal(saved.status, "confirmed");
  assert.match(saved.id, /^bk-/);
});

test("covers are counted only for sittings that overlap the window", async () => {
  const store = new D1BookingStore(db);
  await store.reserve(party(4, "12:00"), 12); // 12:00–12:45
  const at = (t: string) => {
    const s = slotAt(t);
    return store.coversDuring("2026-09-22", s.startsAt, s.endsAt);
  };
  assert.equal(await at("11:00"), 0); // ends before it starts
  assert.equal(await at("12:00"), 4); // overlaps
  assert.equal(await at("13:00"), 0); // starts after it ends
});

test("a full sitting refuses the next party and reports the seats left", async () => {
  const store = new D1BookingStore(db);
  for (let i = 0; i < 5; i++) assert.equal((await store.reserve(party(2), 12)).ok, true); // 10 of 12
  const tooBig = await store.reserve(party(3), 12);
  assert.deepEqual(tooBig, { ok: false, reason: "full", remaining: 2 });
  assert.equal((await store.reserve(party(2), 12)).ok, true); // exactly fills it
  const none = await store.reserve(party(1), 12);
  assert.deepEqual(none, { ok: false, reason: "full", remaining: 0 });
  assert.equal(
    (await store.list("2026-09-22")).reduce((s, b) => s + b.partySize, 0),
    12,
  );
});

test("two simultaneous requests for the last cover: exactly one succeeds and one row exists", async () => {
  const store = new D1BookingStore(db);
  for (let i = 0; i < 11; i++) await store.reserve(party(1), 12); // 11 of 12
  const results = await Promise.all([
    store.reserve(party(1), 12),
    store.reserve(party(1), 12),
  ]);
  assert.deepEqual(results.map((r) => r.ok).sort(), [false, true]);
  const rows = await store.list("2026-09-22");
  assert.equal(rows.length, 12);
  assert.equal(
    rows.reduce((s, b) => s + b.partySize, 0),
    12,
  );
});

test("twenty concurrent parties of two never exceed twelve covers", async () => {
  const store = new D1BookingStore(db);
  const results = await Promise.all(
    Array.from({ length: 20 }, () => store.reserve(party(2), 12)),
  );
  assert.equal(results.filter((r) => r.ok).length, 6);
  assert.equal(
    (await store.list("2026-09-22")).reduce((s, b) => s + b.partySize, 0),
    12,
  );
});

test("the handlers run unchanged against the D1 store", async () => {
  const store = new D1BookingStore(db);
  const notifier = new RecordingNotifier();
  const handlers = createBookingHandlers({
    store,
    notifier,
    limiter: new MemoryRateLimiter(1000, 600_000),
    rules: bookingRules,
    mode: "instant",
    maxBodyBytes: 8 * 1024,
    now: () => NOW,
    clientAddress: forwardedAddress,
  });
  const post = (body: Record<string, string>) =>
    handlers.POST(
      new Request("http://localhost/api/bookings", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.10",
        },
        body: JSON.stringify(body),
      }),
    );
  const good = {
    name: "Ada Lovelace",
    partySize: "6",
    date: "2026-09-22",
    time: "12:00",
    phone: "+44 1392 000000",
    email: "",
    note: "",
    website: "",
  };
  assert.equal((await post(good)).status, 201);
  assert.equal((await post(good)).status, 201);
  const full = await post(good);
  assert.equal(full.status, 409);
  assert.match((await full.json()).errors.time, /filled up/);
  assert.equal(notifier.received.length, 2);
  const availability = await (
    await handlers.GET(new Request("http://localhost/api/bookings?date=2026-09-22"))
  ).json();
  const times = availability.slots.map((s: { time: string }) => s.time);
  assert.ok(!times.includes("12:00"));
  assert.ok(times.includes("13:00"));
});
