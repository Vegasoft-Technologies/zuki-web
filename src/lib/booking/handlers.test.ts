import assert from "node:assert/strict";
import test from "node:test";
import { provisionalRules } from "./config.ts";
import { createBookingHandlers, forwardedAddress } from "./handlers.ts";
import { RecordingNotifier } from "./notifier.ts";
import { MemoryRateLimiter } from "./rateLimit.ts";
import { InMemoryBookingStore } from "./store.ts";

const NOW = new Date("2026-09-21T08:00:00Z"); // Monday 09:00 London

function setup(overrides: Partial<Parameters<typeof createBookingHandlers>[0]> = {}) {
  const store = new InMemoryBookingStore();
  const notifier = new RecordingNotifier();
  const handlers = createBookingHandlers({
    store,
    notifier,
    limiter: new MemoryRateLimiter(1000, 10 * 60_000),
    rules: provisionalRules,
    mode: "instant",
    maxBodyBytes: 8 * 1024,
    now: () => NOW,
    clientAddress: forwardedAddress,
    ...overrides,
  });
  return { store, notifier, handlers };
}

const good = {
  name: "Ada Lovelace",
  partySize: "2",
  date: "2026-09-22",
  time: "12:00",
  phone: "+44 1392 000000",
  email: "",
  note: "",
  website: "",
};

const post = (body: unknown, headers: Record<string, string> = {}, ip = "203.0.113.10") =>
  new Request("http://localhost/api/bookings", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

test("a valid booking is stored, confirmed in instant mode, and the café is notified", async () => {
  const { store, notifier, handlers } = setup();
  const res = await handlers.POST(post(good));
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.booking.status, "confirmed");
  assert.equal(body.copy.successHeading, "Your table is held");
  assert.equal((await store.list("2026-09-22")).length, 1);
  assert.equal(notifier.received.length, 1);
});

test("in manual mode the booking is a request and the copy says so", async () => {
  const { handlers } = setup({ mode: "manual" });
  const body = await (await handlers.POST(post(good))).json();
  assert.equal(body.booking.status, "requested");
  assert.equal(body.copy.successHeading, "Request received");
});

for (const [field, patch, expectKey] of [
  ["missing name", { name: "" }, "name"],
  ["party too large", { partySize: "9" }, "partySize"],
  ["party of zero", { partySize: "0" }, "partySize"],
  ["no contact method", { phone: "", email: "" }, "contact"],
  ["bad email", { phone: "", email: "not-an-email" }, "email"],
  ["bad phone", { phone: "call me" }, "phone"],
  ["invalid date", { date: "2026-02-30" }, "date"],
  ["not a slot time", { time: "12:10" }, "time"],
  ["too soon", { date: "2026-09-21", time: "09:30" }, "time"],
  ["beyond the window", { date: "2026-12-01" }, "date"],
] as const) {
  test(`validation failure: ${field} -> 400 with a message on '${expectKey}'`, async () => {
    const { store, handlers } = setup();
    const res = await handlers.POST(post({ ...good, ...patch }));
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.ok, false);
    assert.equal(typeof body.errors[expectKey], "string");
    assert.equal((await store.list(good.date)).length, 0);
  });
}

test("the honeypot: a filled hidden field looks like success and stores nothing", async () => {
  const { store, notifier, handlers } = setup();
  const res = await handlers.POST(post({ ...good, website: "http://spam.example" }));
  assert.equal(res.status, 200);
  assert.equal((await store.list(good.date)).length, 0);
  assert.equal(notifier.received.length, 0);
});

test("the rate limit: the sixth request from one address in the window is refused", async () => {
  const { handlers } = setup({ limiter: new MemoryRateLimiter(5, 10 * 60_000) });
  for (let i = 0; i < 5; i++) {
    const res = await handlers.POST(post({ ...good, name: "" })); // invalid on purpose; still counts
    assert.equal(res.status, 400);
  }
  const sixth = await handlers.POST(post(good));
  assert.equal(sixth.status, 429);
  assert.equal(sixth.headers.get("retry-after"), "600");
  // a different address is unaffected
  assert.equal((await handlers.POST(post(good, {}, "198.51.100.7"))).status, 201);
});

test("the body size cap refuses an oversized request before parsing it", async () => {
  const { handlers } = setup({ maxBodyBytes: 200 });
  const res = await handlers.POST(post({ ...good, note: "x".repeat(500) }));
  assert.equal(res.status, 413);
});

test("a full sitting answers 409 with the seats remaining", async () => {
  const { handlers } = setup();
  for (let i = 0; i < 6; i++) assert.equal((await handlers.POST(post(good))).status, 201); // 12 covers
  const res = await handlers.POST(post(good));
  assert.equal(res.status, 409);
  const body = await res.json();
  assert.equal(body.remaining, 0);
  assert.match(body.errors.time, /filled up/);
});

test("two simultaneous bookings for the last table: one 201, one 409", async () => {
  const { store, handlers } = setup();
  for (let i = 0; i < 5; i++) await handlers.POST(post(good)); // 10 of 12
  const [a, b] = await Promise.all([
    handlers.POST(post(good)),
    handlers.POST(post(good)),
  ]);
  assert.deepEqual([a.status, b.status].sort(), [201, 409]);
  assert.equal(
    (await store.list(good.date)).reduce((s, x) => s + x.partySize, 0),
    12,
  );
});

test("a plain form post without scripting is answered with a redirect, not JSON", async () => {
  const { handlers } = setup({ mode: "manual" });
  const form = new URLSearchParams(good).toString();
  const res = await handlers.POST(
    post(form, {
      "content-type": "application/x-www-form-urlencoded",
      accept: "text/html,*/*",
    }),
  );
  assert.equal(res.status, 303);
  const location = new URL(res.headers.get("location")!);
  assert.equal(location.pathname, "/book/done");
  assert.equal(location.searchParams.get("status"), "received");
  assert.equal(location.searchParams.get("time"), "12:00");
});

test("a form post with an error redirects with the first message", async () => {
  const { handlers } = setup();
  const form = new URLSearchParams({ ...good, name: "" }).toString();
  const res = await handlers.POST(
    post(form, {
      "content-type": "application/x-www-form-urlencoded",
      accept: "text/html",
    }),
  );
  assert.equal(res.status, 303);
  const location = new URL(res.headers.get("location")!);
  assert.equal(location.searchParams.get("status"), "error");
  assert.match(location.searchParams.get("message")!, /name/);
});

test("availability lists the slots with room and drops any sitting that would overlap a full one", async () => {
  const { handlers } = setup();
  const url = "http://localhost/api/bookings?date=2026-09-22";
  const before = await (await handlers.GET(new Request(url))).json();
  assert.ok(before.slots.some((s: { time: string }) => s.time === "12:00"));
  for (let i = 0; i < 6; i++) await handlers.POST(post(good)); // 12:00–13:30 now holds 12 covers
  const after = await (await handlers.GET(new Request(url))).json();
  const times = after.slots.map((s: { time: string }) => s.time);
  for (const t of ["11:00", "11:30", "12:00", "12:30", "13:00"])
    assert.ok(!times.includes(t), t);
  assert.ok(times.includes("10:30")); // ends as the full sitting starts
  assert.ok(times.includes("13:30")); // starts as it ends
});

test("availability without a date is a 400", async () => {
  const { handlers } = setup();
  assert.equal(
    (await handlers.GET(new Request("http://localhost/api/bookings"))).status,
    400,
  );
});

test("without a trustworthy address the request is refused, not keyed on a supplied header", async () => {
  const { store, handlers } = setup({ clientAddress: undefined });
  const res = await handlers.POST(post(good)); // carries x-forwarded-for, which is not trusted
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /where this request came from/);
  assert.equal((await store.list(good.date)).length, 0);
});

test("with the edge's address the request goes through, whatever a forwarding header says", async () => {
  const { handlers } = setup({ clientAddress: undefined });
  const res = await handlers.POST(
    post(good, { "cf-connecting-ip": "203.0.113.50", "x-forwarded-for": "198.51.100.1" }),
  );
  assert.equal(res.status, 201);
});
