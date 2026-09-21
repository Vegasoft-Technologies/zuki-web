/**
 * The rules the booking system runs on, as confirmed by the café on 2026-09-21. Every
 * figure here is the café's answer; the reasoning behind the two that were left to us
 * (the minimum notice and the last seating) is in docs/decisions/0007.
 */
export interface BookingRules {
  /** How long a table is held for one party. */
  sittingMinutes: number;
  /** Gap between consecutive slot start times. */
  slotIntervalMinutes: number;
  /** Seats that may be booked online for any one overlapping sitting. */
  coversPerSitting: number;
  /** Largest party accepted online; larger parties are asked to telephone. */
  maxPartyOnline: number;
  /** How soon before a sitting a booking may still be made. */
  minNoticeMinutes: number;
  /** How many days ahead the calendar opens. */
  bookingWindowDays: number;
}

export const bookingRules: BookingRules = {
  sittingMinutes: 45,
  slotIntervalMinutes: 60,
  coversPerSitting: 12,
  maxPartyOnline: 6,
  minNoticeMinutes: 30,
  bookingWindowDays: 7,
};

/**
 * "instant" is the requirement: the visitor leaves with a confirmed table.
 * "manual" was the interim setting while the rules above were unconfirmed.
 * Set BOOKING_CONFIRMATION=instant in the environment to switch.
 */
export type ConfirmationMode = "manual" | "instant";

export function confirmationMode(env: NodeJS.ProcessEnv = process.env): ConfirmationMode {
  return env.BOOKING_CONFIRMATION === "instant" ? "instant" : "manual";
}

/** Everything the visitor reads that differs between the two modes. Both written now. */
export const bookingCopy = {
  manual: {
    beforeSubmit:
      "This sends a booking request. The café will confirm it with you by the contact method you give below — please wait for that confirmation before you travel.",
    submitLabel: "Request a table",
    successHeading: "Request received",
    successBody:
      "Thank you. Your request is with the café and is not yet a confirmed table. They will confirm it with you shortly.",
    statusWord: "requested",
  },
  instant: {
    beforeSubmit:
      "Your table is held the moment you submit. You will see the confirmed date and time on the next screen.",
    submitLabel: "Book a table",
    successHeading: "Your table is held",
    successBody: "Thank you. Your table is booked — we look forward to seeing you.",
    statusWord: "confirmed",
  },
} as const;

/** Rate limit for the public endpoint. Ours to set; not a café decision. */
export const rateLimitRules = { maxRequests: 5, windowMinutes: 10 };

/** Largest request body accepted, in bytes. */
export const maxBodyBytes = 8 * 1024;
