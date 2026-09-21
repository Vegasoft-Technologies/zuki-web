import type { ConfirmationMode } from "./config.ts";
import type { BookingRecord } from "./store.ts";

/**
 * How the café hears about a booking. The logging notifier is for development and tests;
 * production sends email through Resend (`resendNotifier.ts`). Personal details are
 * deliberately not logged.
 */
export interface Notifier {
  bookingReceived(booking: BookingRecord, mode: ConfirmationMode): Promise<void>;
}

export class LogNotifier implements Notifier {
  async bookingReceived(booking: BookingRecord, mode: ConfirmationMode): Promise<void> {
    console.info(
      `[booking] ${booking.status} (${mode}) ${booking.id}: ${booking.slot.date} ${booking.slot.time}, party of ${booking.partySize}`,
    );
  }
}

export class RecordingNotifier implements Notifier {
  readonly received: BookingRecord[] = [];
  async bookingReceived(booking: BookingRecord): Promise<void> {
    this.received.push(booking);
  }
}
