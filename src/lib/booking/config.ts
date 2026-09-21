/**
 * The rules the booking system runs on, as confirmed by the café on 2026-09-21. Every
 * figure here is the café's answer; the reasoning behind the two that were left to us
 * (the minimum notice and the last seating) is in docs/decisions/0007.
 */
/** Where a party sits. Required on every booking; there is no default. */
export type Area = "inside" | "outside";
export const AREAS: readonly Area[] = ["inside", "outside"];

/**
 * The café's seating, as it described it on 2026-09-21: inside, 45 to 50 seats across 11
 * tables (the lower figure is used); outside, 30 seats. Guests arrive without booking, so
 * only a share of each area is offered online and the rest is kept for them.
 */
export const seating = {
  inside: { seats: 45, tables: 11 },
  outside: { seats: 30 },
} as const;
export const onlineShare = 0.5;

/** How each area is named and, for outside, the plain warning shown before and after booking. */
export const areaCopy: Record<Area, { label: string; note: string | null }> = {
  inside: { label: "Inside", note: null },
  outside: {
    label: "Outside",
    note: "Our outside tables are under the open sky, so they depend on the weather on the day.",
  },
};

export interface BookingRules {
  /** How long a table is held for one party. */
  sittingMinutes: number;
  /** Gap between consecutive slot start times. */
  slotIntervalMinutes: number;
  /** Seats in each area that may be booked online for any one overlapping sitting. */
  coversPerSitting: Record<Area, number>;
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
  coversPerSitting: {
    inside: Math.floor(seating.inside.seats * onlineShare), // 22
    outside: Math.floor(seating.outside.seats * onlineShare), // 15
  },
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
