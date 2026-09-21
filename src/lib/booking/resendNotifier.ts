import { areaCopy, type ConfirmationMode } from "./config.ts";
import type { Notifier } from "./notifier.ts";
import type { BookingRecord } from "./store.ts";

/**
 * Delivers the booking notice by email through Resend's HTTP API. Configured entirely
 * from the environment: the API key, the address the notice goes to, and the address it
 * is sent from. Until go-live the "to" address is an internal one, never the café's
 * (see docs/decisions/0007).
 *
 * The sending domain has no mailbox, so every message carries Reply-To set to the "to"
 * address; a reply then reaches a real inbox instead of bouncing.
 *
 * A failure here never loses a booking: the table is already held when this runs, the
 * handler treats the notice as best-effort, and this class logs the failure with the
 * booking's identifier so it can be found in the Worker's logs and dealt with by hand.
 */
export interface ResendConfig {
  apiKey: string;
  to: string;
  from: string;
  /** Overridable for tests and a local stand-in. */
  baseUrl?: string;
  fetch?: typeof fetch;
}

export interface Notice {
  subject: string;
  text: string;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** "Saturday 26 September 2026", from the booking's own date, independent of the clock. */
function longDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const at = new Date(Date.UTC(y, m - 1, d, 12));
  return `${DAY_NAMES[at.getUTCDay()]} ${at.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })}`;
}

/**
 * Pure. Everything the café needs to act on the booking without opening anything else,
 * and a plain statement of whether the table is confirmed or awaiting confirmation.
 */
export function renderNotice(booking: BookingRecord, mode: ConfirmationMode): Notice {
  const confirmed = mode === "instant" && booking.status === "confirmed";
  const when = `${longDate(booking.slot.date)}, ${booking.slot.time}`;
  const party = `party of ${booking.partySize}`;
  const area = areaCopy[booking.area];
  const state = confirmed ? "CONFIRMED" : "AWAITING CONFIRMATION";
  const subject = `${confirmed ? "Table booked" : "Table request"}: ${when}, ${party}, ${area.label.toLowerCase()} — ${state.toLowerCase()}`;
  const contact = [
    booking.contact.phone ? `Telephone: ${booking.contact.phone}` : null,
    booking.contact.email ? `Email: ${booking.contact.email}` : null,
  ].filter((line): line is string => line !== null);
  const lines = [
    confirmed
      ? "This table is CONFIRMED. The guest has been told it is held; nothing more is needed unless something changes."
      : "This is a REQUEST, AWAITING CONFIRMATION. The guest has been told the café will confirm by the contact method below. Please confirm or decline with them.",
    "",
    `Name:        ${booking.name}`,
    `Party size:  ${booking.partySize}`,
    `Area:        ${area.label}${area.note ? ` — ${area.note}` : ""}`,
    `Date:        ${longDate(booking.slot.date)}`,
    `Time:        ${booking.slot.time}`,
    ...contact.map((line) => `${line.split(":")[0]}:`.padEnd(13) + line.split(": ")[1]),
    `Note:        ${booking.note ? booking.note : "(none)"}`,
    "",
    `Booking reference: ${booking.id}`,
    `Received: ${booking.createdAt.toISOString()}`,
    "",
    "Reply to this email to reach the person who looks after bookings. The note may contain dietary or accessibility information: use it only for this booking and do not copy it elsewhere.",
  ];
  return { subject, text: lines.join("\n") };
}

export class ResendNotifier implements Notifier {
  private readonly config: ResendConfig;

  constructor(config: ResendConfig) {
    this.config = config;
  }

  async bookingReceived(booking: BookingRecord, mode: ConfirmationMode): Promise<void> {
    const { subject, text } = renderNotice(booking, mode);
    const doFetch = this.config.fetch ?? fetch;
    const url = new URL("/emails", this.config.baseUrl ?? "https://api.resend.com");
    try {
      const response = await doFetch(url, {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.config.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: this.config.from,
          to: [this.config.to],
          reply_to: this.config.to,
          subject,
          text,
        }),
      });
      if (!response.ok) {
        const detail = (await response.text()).slice(0, 300);
        console.error(
          `[booking] notification failed for ${booking.id} (${booking.slot.date} ${booking.slot.time}): provider answered ${response.status} ${detail}`,
        );
        return;
      }
      const { id } = (await response.json().catch(() => ({}))) as { id?: string };
      console.info(
        `[booking] notification sent for ${booking.id}: message ${id ?? "unknown"}`,
      );
    } catch (error) {
      console.error(
        `[booking] notification failed for ${booking.id} (${booking.slot.date} ${booking.slot.time}): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
