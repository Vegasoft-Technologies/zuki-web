/**
 * The rules the booking system runs on.
 *
 * Every figure marked PROVISIONAL is a placeholder chosen so the system can be built and
 * tested. None has been confirmed by the café. They are listed as questions in the pull
 * request that introduced them and must be replaced with the café's answers before the
 * confirmation setting is switched to instant.
 */
export interface BookingRules {
  /** How long a table is held for one party. PROVISIONAL. */
  sittingMinutes: number;
  /** Gap between consecutive slot start times. PROVISIONAL. */
  slotIntervalMinutes: number;
  /** Seats that may be booked online for any one overlapping sitting. PROVISIONAL. */
  coversPerSitting: number;
  /** Largest party accepted online; larger parties are asked to telephone. PROVISIONAL. */
  maxPartyOnline: number;
  /** How soon before a sitting a booking may still be made. PROVISIONAL. */
  minNoticeMinutes: number;
  /** How many days ahead the calendar opens. PROVISIONAL. */
  bookingWindowDays: number;
  /** How long before closing the last sitting may start. PROVISIONAL. */
  lastSeatingBeforeCloseMinutes: number;
}

export const provisionalRules: BookingRules = {
  sittingMinutes: 90,
  slotIntervalMinutes: 30,
  coversPerSitting: 12,
  maxPartyOnline: 6,
  minNoticeMinutes: 60,
  bookingWindowDays: 28,
  lastSeatingBeforeCloseMinutes: 60,
};

/**
 * "instant" is the requirement: the visitor leaves with a confirmed table.
 * "manual" is the interim setting while the rules above are provisional. Switching is the
 * last step of the booking work, done when the café has answered the six questions.
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

/** Rate limit for the public endpoint. PROVISIONAL. */
export const rateLimitRules = { maxRequests: 5, windowMinutes: 10 };

/** Largest request body accepted, in bytes. */
export const maxBodyBytes = 8 * 1024;
