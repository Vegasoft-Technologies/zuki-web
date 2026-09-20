import { bookingCopy, type BookingRules, type ConfirmationMode } from "./config.ts";
import type { Notifier } from "./notifier.ts";
import type { RateLimiter } from "./rateLimit.ts";
import { availableSlots } from "./slots.ts";
import type { BookingStore } from "./store.ts";
import { readInput, validate, type FieldErrors } from "./validate.ts";

export interface Deps {
  store: BookingStore;
  notifier: Notifier;
  limiter: RateLimiter;
  rules: BookingRules;
  mode: ConfirmationMode;
  maxBodyBytes: number;
  /** Injectable so tests can pin the clock. */
  now?: () => Date;
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });

const clientAddress = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip") ||
  "unknown";

/** A plain HTML form post, as opposed to the scripted JSON request. */
const wantsHtml = (request: Request) =>
  (request.headers.get("accept") ?? "").includes("text/html") &&
  (request.headers.get("content-type") ?? "").includes(
    "application/x-www-form-urlencoded",
  );

const redirect = (request: Request, params: Record<string, string>) => {
  const url = new URL("/book/done", request.url);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Response(null, { status: 303, headers: { location: url.toString() } });
};

const firstError = (errors: FieldErrors) =>
  Object.values(errors)[0] ?? "Please check the form.";

/**
 * Builds the two route handlers from their dependencies, so the tests can run them with an
 * in-memory store and a fixed clock, and production can bind real services.
 */
export function createBookingHandlers(deps: Deps) {
  const now = deps.now ?? (() => new Date());

  async function GET(request: Request): Promise<Response> {
    const date = new URL(request.url).searchParams.get("date") ?? "";
    const slots = availableSlots(date, deps.rules, now());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      return json({ error: "date is required, YYYY-MM-DD" }, 400);
    const withRoom = [];
    for (const slot of slots) {
      const used = await deps.store.coversDuring(slot.date, slot.startsAt, slot.endsAt);
      const remaining = Math.max(0, deps.rules.coversPerSitting - used);
      if (remaining > 0) withRoom.push({ time: slot.time, remaining });
    }
    return json({ date, slots: withRoom, maxPartyOnline: deps.rules.maxPartyOnline });
  }

  async function POST(request: Request): Promise<Response> {
    const html = wantsHtml(request);
    const fail = (
      status: number,
      errors: FieldErrors,
      extra: Record<string, unknown> = {},
    ) =>
      html
        ? redirect(request, { status: "error", message: firstError(errors) })
        : json({ ok: false, errors, ...extra }, status);

    // Body size, checked before anything is parsed.
    const declared = Number(request.headers.get("content-length") ?? 0);
    if (declared > deps.maxBodyBytes)
      return json({ ok: false, error: "Request too large." }, 413);
    const text = await request.text();
    if (text.length > deps.maxBodyBytes)
      return json({ ok: false, error: "Request too large." }, 413);

    let raw: Record<string, unknown> = {};
    try {
      raw = (request.headers.get("content-type") ?? "").includes("application/json")
        ? (JSON.parse(text) as Record<string, unknown>)
        : Object.fromEntries(new URLSearchParams(text));
    } catch {
      return fail(400, { name: "We could not read that form. Please try again." });
    }
    const input = readInput(raw);

    // The honeypot: a filled hidden field is a bot. Answer as if it worked and store nothing.
    if (input.website) {
      return html ? redirect(request, { status: "received" }) : json({ ok: true }, 200);
    }

    if (!deps.limiter.allow(clientAddress(request), now().getTime())) {
      return html
        ? redirect(request, {
            status: "error",
            message: "Too many attempts — please wait a few minutes and try again.",
          })
        : json(
            {
              ok: false,
              error: "Too many attempts — please wait a few minutes and try again.",
            },
            429,
            {
              "retry-after": "600",
            },
          );
    }

    const result = validate(input, deps.rules, now());
    if (!result.ok) return fail(400, result.errors);

    const reserved = await deps.store.reserve(
      { ...result.value, status: deps.mode === "instant" ? "confirmed" : "requested" },
      deps.rules.coversPerSitting,
    );
    if (!reserved.ok) {
      const message =
        reserved.remaining > 0
          ? `Only ${reserved.remaining} ${reserved.remaining === 1 ? "seat is" : "seats are"} left at that time — please choose another time or a smaller party.`
          : "That time has just filled up — please choose another.";
      return fail(409, { time: message }, { remaining: reserved.remaining });
    }

    try {
      await deps.notifier.bookingReceived(reserved.booking, deps.mode);
    } catch {
      // The table is held either way; a notification failure is logged by the notifier.
    }

    const { booking } = reserved;
    const summary = {
      id: booking.id,
      date: booking.slot.date,
      time: booking.slot.time,
      partySize: booking.partySize,
      status: booking.status,
    };
    if (html) {
      return redirect(request, {
        status: deps.mode === "instant" ? "held" : "received",
        date: booking.slot.date,
        time: booking.slot.time,
        party: String(booking.partySize),
      });
    }
    return json(
      { ok: true, mode: deps.mode, copy: bookingCopy[deps.mode], booking: summary },
      201,
    );
  }

  return { GET, POST };
}
