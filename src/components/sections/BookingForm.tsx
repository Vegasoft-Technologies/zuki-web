"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { site } from "@/data/site";
import {
  AREAS,
  areaCopy,
  bookingCopy,
  type Area,
  type ConfirmationMode,
} from "@/lib/booking/config";

interface BookingFormProps {
  mode: ConfirmationMode;
  maxPartyOnline: number;
  /** Every start time on any day; the server rejects ones invalid for the chosen date. */
  templateTimes: string[];
  /** Days ahead the calendar is open. */
  windowDays: number;
}

interface SlotOption {
  time: string;
  /** Seats still bookable online in each area. */
  remaining: Record<Area, number>;
}

type Errors = Partial<
  Record<
    "name" | "partySize" | "area" | "date" | "time" | "phone" | "email" | "contact",
    string
  >
>;

interface Done {
  heading: string;
  body: string;
  date: string;
  time: string;
  partySize: number;
  areaLabel: string;
  areaNote: string | null;
}

const FIELDS = [
  "name",
  "partySize",
  "area",
  "date",
  "time",
  "phone",
  "email",
  "note",
  "website",
] as const;

// Today's date in London, read in the browser only. The server ships no min or max so it
// never renders a value that depends on the clock.
let todayCache: string | null = null;
const subscribe = () => () => {};
const getToday = () => {
  if (todayCache === null) {
    const p = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/London",
    }).formatToParts(new Date());
    const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
    todayCache = `${g("year")}-${g("month")}-${g("day")}`;
  }
  return todayCache;
};
const getServerToday = () => "";

function plusDays(iso: string, days: number) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export default function BookingForm({
  mode,
  maxPartyOnline,
  templateTimes,
  windowDays,
}: BookingFormProps) {
  const copy = bookingCopy[mode];
  const today = useSyncExternalStore(subscribe, getToday, getServerToday);

  const [date, setDate] = useState("");
  const [area, setArea] = useState<Area | "">("");
  const [slots, setSlots] = useState<SlotOption[] | null>(null);
  const [slotsState, setSlotsState] = useState<"idle" | "loading" | "failed">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [generalError, setGeneralError] = useState("");
  const inFlight = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const slotsRequest = useRef<AbortController | null>(null);

  // Ask the server which times still have room for the chosen date. Runs from the change
  // handler, so a stale response from an earlier date is abandoned rather than applied.
  function loadSlots(forDate: string) {
    slotsRequest.current?.abort();
    if (!forDate) {
      setSlots(null);
      setSlotsState("idle");
      return;
    }
    const controller = new AbortController();
    slotsRequest.current = controller;
    setSlotsState("loading");
    fetch(`/api/bookings?date=${encodeURIComponent(forDate)}`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { slots: SlotOption[] }) => {
        if (controller.signal.aborted) return;
        setSlots(data.slots);
        setSlotsState("idle");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSlots(null);
        setSlotsState("failed");
      });
  }

  useEffect(() => {
    if (Object.keys(errors).length || generalError) summaryRef.current?.focus();
  }, [errors, generalError]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return; // never twice
    inFlight.current = true;
    setSubmitting(true);
    setErrors({});
    setGeneralError("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(FIELDS.map((f) => [f, String(data.get(f) ?? "")]));

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok && body.ok && body.booking) {
        setDone({
          heading: body.copy.successHeading,
          body: body.copy.successBody,
          date: body.booking.date,
          time: body.booking.time,
          partySize: body.booking.partySize,
          areaLabel: body.booking.areaLabel,
          areaNote: body.booking.areaNote ?? null,
        });
      } else if (body.errors) {
        setErrors(body.errors as Errors);
        if (response.status === 409 && date) loadSlots(date); // the picture has changed
      } else {
        setGeneralError(
          body.error || "Something went wrong. Please try again or telephone us.",
        );
      }
    } catch {
      setGeneralError(
        "We could not reach the café's booking service. Please try again or telephone us.",
      );
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="booking__done" role="status" aria-live="polite">
        <h4>{done.heading}</h4>
        <p>{done.body}</p>
        <p className="booking__done-slot">
          {done.date} at {done.time} · party of {done.partySize} · {done.areaLabel}
        </p>
        {done.areaNote && <p>{done.areaNote}</p>}
      </div>
    );
  }

  const errorId = (field: string) => `booking-${field}-error`;
  const describe = (field: keyof Errors) => (errors[field] ? errorId(field) : undefined);
  const errorList = Object.entries(errors).filter(([, message]) => message);
  // Until an area is chosen every slot with room anywhere is offered; once chosen, only the
  // slots with room in that area, so the guest sees inside full while outside is not.
  const timeOptions = slots
    ? slots
        .filter((s) => (area ? s.remaining[area] > 0 : true))
        .map((s) => ({ time: s.time, remaining: area ? s.remaining[area] : null }))
    : templateTimes.map((time) => ({ time, remaining: null }));

  return (
    <form
      className="booking"
      method="post"
      action="/api/bookings"
      noValidate
      onSubmit={onSubmit}
      aria-describedby="booking-policy"
    >
      <p className="booking__policy" id="booking-policy">
        {copy.beforeSubmit}
      </p>

      {(errorList.length > 0 || generalError) && (
        <div className="booking__summary" role="alert" tabIndex={-1} ref={summaryRef}>
          {generalError ? (
            <p>{generalError}</p>
          ) : (
            <>
              <p>Please check the following:</p>
              <ul>
                {errorList.map(([field, message]) => (
                  <li key={field}>
                    <a
                      href={`#booking-${field === "contact" ? "phone" : field === "area" ? "area-inside" : field}`}
                    >
                      {message}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="booking__row">
        <div className="booking__field">
          <label htmlFor="booking-name">Name</label>
          <input
            id="booking-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={80}
            aria-invalid={!!errors.name}
            aria-describedby={describe("name")}
          />
          {errors.name && (
            <p className="booking__error" id={errorId("name")}>
              {errors.name}
            </p>
          )}
        </div>

        <div className="booking__field">
          <label htmlFor="booking-partySize">People</label>
          <select
            id="booking-partySize"
            name="partySize"
            required
            defaultValue="2"
            aria-invalid={!!errors.partySize}
            aria-describedby={describe("partySize")}
          >
            {Array.from({ length: maxPartyOnline }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <p className="booking__hint">
            More than {maxPartyOnline}? Please call{" "}
            <a href={`tel:${site.telephone}`}>{site.telephoneDisplay}</a>.
          </p>
          {errors.partySize && (
            <p className="booking__error" id={errorId("partySize")}>
              {errors.partySize}
            </p>
          )}
        </div>
      </div>

      <fieldset
        className="booking__areas"
        data-invalid={errors.area ? "true" : undefined}
        aria-describedby={[describe("area"), "booking-area-note"]
          .filter(Boolean)
          .join(" ")}
      >
        <legend>Where would you like to sit?</legend>
        <div className="booking__area-options">
          {AREAS.map((option) => (
            <label
              key={option}
              className="booking__area"
              htmlFor={`booking-area-${option}`}
            >
              <input
                id={`booking-area-${option}`}
                type="radio"
                name="area"
                value={option}
                required
                checked={area === option}
                onChange={() => setArea(option)}
              />
              <span>{areaCopy[option].label}</span>
            </label>
          ))}
        </div>
        <p className="booking__hint" id="booking-area-note">
          {areaCopy.outside.note}
        </p>
        {errors.area && (
          <p className="booking__error" id={errorId("area")}>
            {errors.area}
          </p>
        )}
      </fieldset>

      <div className="booking__row">
        <div className="booking__field">
          <label htmlFor="booking-date">Date</label>
          <input
            id="booking-date"
            name="date"
            type="date"
            required
            min={today || undefined}
            max={today ? plusDays(today, windowDays) : undefined}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              loadSlots(e.target.value);
            }}
            aria-invalid={!!errors.date}
            aria-describedby={describe("date")}
          />
          {errors.date && (
            <p className="booking__error" id={errorId("date")}>
              {errors.date}
            </p>
          )}
        </div>

        <div className="booking__field">
          <label htmlFor="booking-time">Time</label>
          <select
            id="booking-time"
            name="time"
            required
            defaultValue=""
            disabled={slotsState === "loading"}
            aria-invalid={!!errors.time}
            aria-describedby={describe("time")}
          >
            <option value="" disabled>
              {slotsState === "loading" ? "Checking…" : "Choose a time"}
            </option>
            {timeOptions.map((s) => (
              <option key={s.time} value={s.time}>
                {s.time}
                {s.remaining !== null && s.remaining <= 4 ? ` — ${s.remaining} left` : ""}
              </option>
            ))}
          </select>
          {slots && timeOptions.length === 0 && (
            <p className="booking__hint">
              {area
                ? `No ${area} tables left online that day — please try the other area, another date, or call us.`
                : "No tables left online that day — please try another date or call us."}
            </p>
          )}
          {slotsState === "failed" && (
            <p className="booking__hint">
              We could not check availability; you can still send the booking.
            </p>
          )}
          {errors.time && (
            <p className="booking__error" id={errorId("time")}>
              {errors.time}
            </p>
          )}
        </div>
      </div>

      <fieldset className="booking__contact" aria-describedby={describe("contact")}>
        <legend>How should we reach you? One is enough.</legend>
        <div className="booking__row">
          <div className="booking__field">
            <label htmlFor="booking-phone">Telephone</label>
            <input
              id="booking-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              maxLength={20}
              aria-invalid={!!errors.phone}
              aria-describedby={describe("phone")}
            />
            {errors.phone && (
              <p className="booking__error" id={errorId("phone")}>
                {errors.phone}
              </p>
            )}
          </div>
          <div className="booking__field">
            <label htmlFor="booking-email">Email</label>
            <input
              id="booking-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              maxLength={120}
              aria-invalid={!!errors.email}
              aria-describedby={describe("email")}
            />
            {errors.email && (
              <p className="booking__error" id={errorId("email")}>
                {errors.email}
              </p>
            )}
          </div>
        </div>
        {errors.contact && (
          <p className="booking__error" id={errorId("contact")}>
            {errors.contact}
          </p>
        )}
      </fieldset>

      <div className="booking__field">
        <label htmlFor="booking-note">Anything we should know? (optional)</label>
        <textarea
          id="booking-note"
          name="note"
          rows={2}
          maxLength={300}
          aria-describedby="booking-note-hint"
        />
        <p className="booking__hint" id="booking-note-hint">
          Allergies, a pushchair, a birthday — we use this only to get ready for your
          visit; only the café sees it, and it is deleted with your booking.
        </p>
      </div>

      {/* Real visitors never see this field. Anything that fills it is not a person. */}
      <div className="booking__hp" aria-hidden="true">
        <label htmlFor="booking-website">Website</label>
        <input
          id="booking-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button
        className="btn btn--gold"
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting ? "Sending…" : copy.submitLabel}
      </button>
    </form>
  );
}
