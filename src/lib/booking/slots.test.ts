import assert from "node:assert/strict";
import test from "node:test";
import { provisionalRules as rules } from "./config.ts";
import { availableSlots, checkSlot, daySlotTimes, templateTimes } from "./slots.ts";
import { InMemoryBookingStore } from "./store.ts";
import { londonToInstant, parseDate } from "./time.ts";

// A fixed "now": Monday 21 September 2026, 09:00 in London (BST, so 08:00Z).
const NOW = new Date("2026-09-21T08:00:00Z");
const problem = (date: string, time: string, now = NOW) => {
  const c = checkSlot(date, time, rules, now);
  return c.ok ? "ok" : c.problem;
};

test("slot times for a weekday run from opening to an hour before closing, every half hour", () => {
  const times = daySlotTimes(parseDate("2026-09-21")!, rules); // Monday 08:00–17:00
  assert.equal(times[0], 8 * 60);
  assert.equal(times[times.length - 1], 16 * 60);
  assert.equal(times.length, 17);
});

test("Sunday opens later and closes earlier, from the same source of truth", () => {
  const times = daySlotTimes(parseDate("2026-09-27")!, rules); // Sunday 10:00–16:00
  assert.equal(times[0], 10 * 60);
  assert.equal(times[times.length - 1], 15 * 60);
});

test("before opening is rejected", () => {
  assert.equal(problem("2026-09-22", "07:30"), "outside-hours");
  assert.equal(problem("2026-09-27", "09:30"), "outside-hours"); // Sunday
});

test("after the last seating is rejected, and the last seating itself is allowed", () => {
  assert.equal(problem("2026-09-22", "16:00"), "ok");
  assert.equal(problem("2026-09-22", "16:30"), "outside-hours");
  assert.equal(problem("2026-09-22", "17:00"), "outside-hours");
});

test("a time between slots is rejected", () => {
  assert.equal(problem("2026-09-22", "10:15"), "not-a-slot-time");
});

test("inside the minimum notice is rejected, and the boundary minute is allowed", () => {
  // now is 09:00; notice is 60 minutes.
  assert.equal(problem("2026-09-21", "09:30"), "too-soon");
  assert.equal(problem("2026-09-21", "10:00"), "ok"); // exactly 60 minutes ahead
  assert.equal(problem("2026-09-21", "10:00", new Date(NOW.getTime() + 1)), "too-soon");
});

test("a date in the past is rejected", () => {
  assert.equal(problem("2026-09-20", "12:00"), "too-soon");
});

test("beyond the booking window is rejected, and the last day of the window is allowed", () => {
  assert.equal(problem("2026-10-19", "12:00"), "ok"); // 28 days ahead
  assert.equal(problem("2026-10-20", "12:00"), "too-far-ahead");
});

test("malformed input is rejected before anything else", () => {
  assert.equal(problem("2026-02-30", "12:00"), "invalid-date");
  assert.equal(problem("21/09/2026", "12:00"), "invalid-date");
  assert.equal(problem("2026-09-22", "9:00"), "invalid-time");
  assert.equal(problem("2026-09-22", "25:00"), "invalid-time");
});

test("British Summer Time: an 08:00 slot in July is 07:00Z, in January it is 08:00Z", () => {
  const july = checkSlot("2026-07-15", "08:00", rules, new Date("2026-07-01T00:00:00Z"));
  const jan = checkSlot("2026-01-14", "08:00", rules, new Date("2026-01-01T00:00:00Z"));
  assert.ok(july.ok && jan.ok);
  assert.equal(july.slot.startsAt.toISOString(), "2026-07-15T07:00:00.000Z");
  assert.equal(jan.slot.startsAt.toISOString(), "2026-01-14T08:00:00.000Z");
});

test("the notice check uses London time on both sides of the clock change", () => {
  // The clocks go back on Sunday 25 October 2026. The same UTC clock time, 07:30Z, is
  // 08:30 in London on the Saturday before (BST) and 07:30 on the Monday after (GMT),
  // so a 09:00 slot is 30 minutes away on one and 90 on the other.
  assert.equal(
    problem("2026-10-24", "09:00", new Date("2026-10-24T07:30:00Z")),
    "too-soon",
  );
  assert.equal(problem("2026-10-26", "09:00", new Date("2026-10-26T07:30:00Z")), "ok");
});

test("available slots exclude the ones too soon and keep the rest in order", () => {
  const slots = availableSlots("2026-09-21", rules, NOW).map((s) => s.time);
  assert.equal(slots[0], "10:00");
  assert.equal(slots[slots.length - 1], "16:00");
});

test("the template covers every start time on any day of the week", () => {
  const t = templateTimes(rules);
  assert.equal(t[0], "08:00");
  assert.equal(t[t.length - 1], "16:00");
  assert.ok(t.includes("15:30"));
});

const slotOn = (date: string, time: string) => {
  const c = checkSlot(date, time, rules, new Date("2026-09-01T00:00:00Z"));
  if (!c.ok) throw new Error(`test slot invalid: ${c.problem}`);
  return c.slot;
};
const party = (n: number, date: string, time: string) => ({
  name: "Test",
  partySize: n,
  slot: slotOn(date, time),
  contact: { phone: "+44 1392 000000" },
  status: "confirmed" as const,
});

test("capacity: exactly at capacity is accepted, one over is refused", async () => {
  const store = new InMemoryBookingStore();
  assert.equal((await store.reserve(party(10, "2026-09-22", "12:00"), 12)).ok, true);
  assert.equal((await store.reserve(party(2, "2026-09-22", "12:00"), 12)).ok, true); // 12 of 12
  const over = await store.reserve(party(1, "2026-09-22", "12:00"), 12);
  assert.equal(over.ok, false);
  assert.equal(!over.ok && over.remaining, 0);
});

test("capacity counts overlapping sittings, not only the same start time", async () => {
  const store = new InMemoryBookingStore();
  await store.reserve(party(12, "2026-09-22", "12:00"), 12); // holds 12:00–13:30
  assert.equal((await store.reserve(party(1, "2026-09-22", "13:00"), 12)).ok, false); // overlaps
  assert.equal((await store.reserve(party(1, "2026-09-22", "13:30"), 12)).ok, true); // starts as it ends
});

test("two simultaneous bookings for the last table: exactly one succeeds", async () => {
  const store = new InMemoryBookingStore();
  await store.reserve(party(10, "2026-09-23", "12:00"), 12); // 2 seats left
  const [a, b] = await Promise.all([
    store.reserve(party(2, "2026-09-23", "12:00"), 12),
    store.reserve(party(2, "2026-09-23", "12:00"), 12),
  ]);
  assert.equal([a.ok, b.ok].filter(Boolean).length, 1);
  assert.equal(
    (await store.list("2026-09-23")).reduce((s, x) => s + x.partySize, 0),
    12,
  );
});

test("londonToInstant handles the clocks going forward", () => {
  // 29 March 2026 at 01:00 GMT the clocks go to 02:00 BST. 09:00 that day is 08:00Z.
  assert.equal(
    londonToInstant(2026, 3, 29, 9 * 60).toISOString(),
    "2026-03-29T08:00:00.000Z",
  );
});
