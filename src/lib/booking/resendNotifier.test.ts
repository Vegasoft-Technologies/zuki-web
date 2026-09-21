import assert from "node:assert/strict";
import test from "node:test";
import { renderNotice, ResendNotifier } from "./resendNotifier.ts";
import type { BookingRecord } from "./store.ts";

const booking: BookingRecord = {
  id: "bk-test-1",
  name: "Ada Lovelace",
  partySize: 4,
  area: "inside",
  slot: {
    date: "2026-09-26",
    time: "12:30",
    startsAt: new Date("2026-09-26T11:30:00Z"),
    endsAt: new Date("2026-09-26T13:00:00Z"),
  },
  contact: { phone: "+44 1392 000000", email: "ada@example.com" },
  note: "One of us is coeliac; a high chair please.",
  status: "requested",
  createdAt: new Date("2026-09-21T10:00:00Z"),
};

test("the notice carries every field and says the booking awaits confirmation", () => {
  const { subject, text } = renderNotice(booking, "manual");
  assert.equal(
    subject,
    "Table request: Saturday 26 September 2026, 12:30, party of 4, inside — awaiting confirmation",
  );
  for (const expected of [
    "AWAITING CONFIRMATION",
    "Name:        Ada Lovelace",
    "Party size:  4",
    "Area:        Inside",
    "Date:        Saturday 26 September 2026",
    "Time:        12:30",
    "Telephone:   +44 1392 000000",
    "Email:       ada@example.com",
    "Note:        One of us is coeliac; a high chair please.",
    "Booking reference: bk-test-1",
  ]) {
    assert.ok(text.includes(expected), expected);
  }
});

test("a confirmed booking in instant mode says so, and an absent note is stated", () => {
  const { subject, text } = renderNotice(
    {
      ...booking,
      status: "confirmed",
      note: undefined,
      contact: { phone: "01392 000000" },
    },
    "instant",
  );
  assert.match(subject, /^Table booked: .* — confirmed$/);
  assert.ok(text.includes("This table is CONFIRMED"));
  assert.ok(text.includes("Note:        (none)"));
  assert.ok(!text.includes("Email:"));
});

const capture = () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchStub = (async (url: URL | string, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify({ id: "msg-1" }), { status: 200 });
  }) as typeof fetch;
  return { calls, fetchStub };
};

test("the message goes to the configured address with Reply-To set to it, from the sender", async () => {
  const { calls, fetchStub } = capture();
  const notifier = new ResendNotifier({
    apiKey: "re_test",
    to: "owner@example.com",
    from: "Bookings <bookings@example.org>",
    fetch: fetchStub,
  });
  await notifier.bookingReceived(booking, "manual");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.resend.com/emails");
  const headers = calls[0].init.headers as Record<string, string>;
  assert.equal(headers.authorization, "Bearer re_test");
  const body = JSON.parse(calls[0].init.body as string);
  assert.deepEqual(body.to, ["owner@example.com"]);
  assert.equal(body.reply_to, "owner@example.com");
  assert.equal(body.from, "Bookings <bookings@example.org>");
  assert.match(body.subject, /awaiting confirmation/);
  assert.ok(body.text.includes("Ada Lovelace"));
});

test("a provider error or an unreachable provider is logged and never thrown", async () => {
  const errors: string[] = [];
  const original = console.error;
  console.error = (message: string) => errors.push(String(message));
  try {
    const failing = new ResendNotifier({
      apiKey: "re_wrong",
      to: "owner@example.com",
      from: "b@example.org",
      fetch: (async () =>
        new Response('{"message":"API key is invalid"}', {
          status: 401,
        })) as typeof fetch,
    });
    await failing.bookingReceived(booking, "manual");
    const unreachable = new ResendNotifier({
      apiKey: "re_test",
      to: "owner@example.com",
      from: "b@example.org",
      fetch: (async () => {
        throw new Error("connect ECONNREFUSED");
      }) as typeof fetch,
    });
    await unreachable.bookingReceived(booking, "manual");
  } finally {
    console.error = original;
  }
  assert.equal(errors.length, 2);
  assert.match(errors[0], /notification failed for bk-test-1 .* 401/);
  assert.match(errors[1], /notification failed for bk-test-1 .* ECONNREFUSED/);
});

test("the area is on its own line, the subject names it, and the weather note appears only for outside", () => {
  const inside = renderNotice(booking, "manual");
  assert.match(inside.subject, /, inside — /);
  assert.ok(!inside.text.includes("weather"));
  const outside = renderNotice({ ...booking, area: "outside" }, "manual");
  assert.match(outside.subject, /, outside — /);
  assert.ok(
    outside.text.includes(
      "Area:        Outside — Our outside tables are under the open sky, so they depend on the weather on the day.",
    ),
  );
});
