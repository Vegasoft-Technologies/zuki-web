import assert from "node:assert/strict";
import test from "node:test";
import { bookingCopy, bookingRules } from "./config.ts";
import { createBookingHandlers, forwardedAddress } from "./handlers.ts";
import { RecordingNotifier } from "./notifier.ts";
import { renderNotice } from "./resendNotifier.ts";
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
    rules: bookingRules,
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
  area: "inside",
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
  ["no area", { area: "" }, "area"],
  ["unknown area", { area: "garden" }, "area"],
  ["no contact method", { phone: "", email: "" }, "contact"],
  ["bad email", { phone: "", email: "not-an-email" }, "email"],
  ["bad phone", { phone: "call me" }, "phone"],
  ["invalid date", { date: "2026-02-30" }, "date"],
  ["not a slot time", { time: "12:10" }, "time"],
  ["too soon", { date: "2026-09-21", time: "09:00" }, "time"],
  ["after the kitchen closes", { date: "2026-09-22", time: "16:00" }, "time"],
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

test("a full inside sitting answers 409 with the seats remaining, while outside still accepts", async () => {
  const { handlers } = setup();
  for (let i = 0; i < 11; i++)
    assert.equal((await handlers.POST(post(good))).status, 201); // 22 inside
  const res = await handlers.POST(post(good));
  assert.equal(res.status, 409);
  const body = await res.json();
  assert.equal(body.remaining, 0);
  assert.match(body.errors.time, /filled up inside/);
  assert.equal((await handlers.POST(post({ ...good, area: "outside" }))).status, 201);
});

test("a full outside sitting rejects the next outside guest while inside still accepts", async () => {
  const { handlers } = setup();
  const outside = { ...good, area: "outside", partySize: "5" };
  for (let i = 0; i < 3; i++)
    assert.equal((await handlers.POST(post(outside))).status, 201); // 15
  const res = await handlers.POST(post({ ...outside, partySize: "1" }));
  assert.equal(res.status, 409);
  assert.match((await res.json()).errors.time, /outside/);
  assert.equal((await handlers.POST(post(good))).status, 201);
});

test("twenty simultaneous requests for the last inside seat: exactly one 201, 22 inside covers", async () => {
  const { store, handlers } = setup();
  for (let i = 0; i < 7; i++) await handlers.POST(post({ ...good, partySize: "3" })); // 21 of 22
  const results = await Promise.all(
    Array.from({ length: 20 }, () => handlers.POST(post({ ...good, partySize: "1" }))),
  );
  const statuses = results.map((r) => r.status);
  assert.equal(statuses.filter((s) => s === 201).length, 1);
  assert.equal(statuses.filter((s) => s === 409).length, 19);
  const inside = (await store.list(good.date)).filter((x) => x.area === "inside");
  assert.equal(
    inside.reduce((s, x) => s + x.partySize, 0),
    22,
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
  for (let i = 0; i < 11; i++) await handlers.POST(post(good)); // 12:00–12:45 holds 22 inside
  const after = await (await handlers.GET(new Request(url))).json();
  const at12 = after.slots.find((s: { time: string }) => s.time === "12:00");
  assert.deepEqual(at12.remaining, { inside: 0, outside: 15 }); // still listed: outside has room
  const at11 = after.slots.find((s: { time: string }) => s.time === "11:00");
  assert.deepEqual(at11.remaining, { inside: 22, outside: 15 }); // ends before the full sitting
  for (let i = 0; i < 3; i++)
    await handlers.POST(post({ ...good, area: "outside", partySize: "5" }));
  const both = await (await handlers.GET(new Request(url))).json();
  assert.ok(!both.slots.some((s: { time: string }) => s.time === "12:00")); // both areas full
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

// Instant confirmation: a table that is stored is confirmed, and nothing else may say so.
const CONFIRMED_WORDS = /confirmed|is held|Your table|booked/i;

test("a stored booking always answers with the confirmed wording, and the notice says confirmed", async () => {
  const notifier = new RecordingNotifier();
  const { handlers } = setup({ notifier });
  for (const variant of [
    good,
    { ...good, area: "outside" },
    { ...good, partySize: "6", time: "15:00" },
  ]) {
    const res = await handlers.POST(post(variant));
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.booking.status, "confirmed");
    assert.equal(body.copy.beforeSubmit, bookingCopy.instant.beforeSubmit);
    assert.equal(body.copy.submitLabel, "Book a table");
    assert.equal(body.copy.successHeading, "Your table is held");
    assert.match(body.copy.successBody, /Your table is booked/);
  }
  assert.equal(notifier.received.length, 3);
  for (const booking of notifier.received) {
    const notice = renderNotice(booking, "instant");
    assert.match(notice.subject, /^Table booked: .* — confirmed$/);
    assert.match(notice.text.split("\n")[0], /^This table is CONFIRMED/);
  }
});

test("a booking rejected for capacity, notice, window, party size, a closed kitchen or a missing area never carries the confirmed wording", async () => {
  const notifier = new RecordingNotifier();
  const { store, handlers } = setup({ notifier });
  for (let i = 0; i < 11; i++) await handlers.POST(post(good)); // inside full at 12:00
  const rejected = [
    ["capacity", good],
    ["notice", { ...good, date: "2026-09-21", time: "09:00" }],
    ["window", { ...good, date: "2026-09-29" }],
    ["party size", { ...good, partySize: "7" }],
    ["closed kitchen", { ...good, time: "16:00" }],
    ["no area", { ...good, area: "" }],
  ] as const;
  const stored = (await store.list(good.date)).length;
  for (const [reason, payload] of rejected) {
    const res = await handlers.POST(post(payload));
    assert.ok(res.status === 400 || res.status === 409, `${reason}: ${res.status}`);
    const text = await res.text();
    assert.doesNotMatch(text, CONFIRMED_WORDS, reason);
  }
  assert.equal((await store.list(good.date)).length, stored);
  assert.equal(notifier.received.length, 11);
});
