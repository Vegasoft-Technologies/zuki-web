import type { Slot } from "./slots.ts";

export type BookingStatus = "requested" | "confirmed";

export interface Contact {
  phone?: string;
  email?: string;
}

export interface BookingRecord {
  id: string;
  name: string;
  partySize: number;
  slot: Slot;
  contact: Contact;
  note?: string;
  status: BookingStatus;
  createdAt: Date;
}

export type ReserveRequest = Omit<BookingRecord, "id" | "createdAt">;

export type ReserveResult =
  { ok: true; booking: BookingRecord } | { ok: false; reason: "full"; remaining: number };

/**
 * Where reservations live. Two implementations are planned: this in-memory one for tests
 * and local development, and a Postgres one once hosting is settled.
 *
 * `reserve` is the whole point of the interface. It must decide "is there room" and
 * "take the room" as one step. A read followed by a write lets two visitors take the
 * last table at the same moment.
 */
export interface BookingStore {
  /** Covers already booked whose sittings overlap the given window. */
  coversDuring(date: string, startsAt: Date, endsAt: Date): Promise<number>;
  /** Atomic: books the party if, and only if, the overlapping covers stay within capacity. */
  reserve(request: ReserveRequest, capacity: number): Promise<ReserveResult>;
  /** Every booking on a date. */
  list(date: string): Promise<BookingRecord[]>;
}

const overlaps = (a: Slot, startsAt: Date, endsAt: Date) =>
  a.startsAt.getTime() < endsAt.getTime() && startsAt.getTime() < a.endsAt.getTime();

export class InMemoryBookingStore implements BookingStore {
  private readonly bookings = new Map<string, BookingRecord[]>();
  private readonly locks = new Map<string, Promise<unknown>>();
  private counter = 0;

  async coversDuring(date: string, startsAt: Date, endsAt: Date): Promise<number> {
    // The pause stands in for a database round trip. Without the lock in `reserve`,
    // two concurrent calls would both read the same count here and both proceed.
    await new Promise((r) => setTimeout(r, 1));
    return (this.bookings.get(date) ?? [])
      .filter((b) => overlaps(b.slot, startsAt, endsAt))
      .reduce((sum, b) => sum + b.partySize, 0);
  }

  reserve(request: ReserveRequest, capacity: number): Promise<ReserveResult> {
    // One lock per date: reservations for the same day queue behind each other, so the
    // count-then-insert below cannot interleave with another party's.
    return this.withLock(request.slot.date, async () => {
      const used = await this.coversDuring(
        request.slot.date,
        request.slot.startsAt,
        request.slot.endsAt,
      );
      const remaining = Math.max(0, capacity - used);
      if (request.partySize > remaining) return { ok: false, reason: "full", remaining };
      this.counter += 1;
      const booking: BookingRecord = {
        ...request,
        id: `bk-${Date.now().toString(36)}-${this.counter}`,
        createdAt: new Date(),
      };
      const list = this.bookings.get(request.slot.date) ?? [];
      list.push(booking);
      this.bookings.set(request.slot.date, list);
      return { ok: true, booking };
    });
  }

  async list(date: string): Promise<BookingRecord[]> {
    return [...(this.bookings.get(date) ?? [])];
  }

  private withLock<T>(key: string, work: () => Promise<T>): Promise<T> {
    const previous = this.locks.get(key) ?? Promise.resolve();
    const next = previous.then(work, work);
    this.locks.set(
      key,
      next.catch(() => undefined),
    );
    return next;
  }
}
