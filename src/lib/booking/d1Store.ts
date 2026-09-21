import type { Area } from "./config.ts";
import type { Slot } from "./slots.ts";
import type {
  BookingRecord,
  BookingStatus,
  BookingStore,
  ReserveRequest,
  ReserveResult,
} from "./store.ts";

/**
 * The part of the D1 client this store uses, typed here so the store and its tests do
 * not depend on the Workers type package. A real D1Database satisfies it.
 */
export interface D1Like {
  prepare(sql: string): D1StatementLike;
}

export interface D1StatementLike {
  bind(...values: unknown[]): D1StatementLike;
  run(): Promise<{ meta: { changes: number } }>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
}

interface Row {
  id: string;
  name: string;
  party_size: number;
  area: Area;
  date: string;
  time: string;
  starts_at: number;
  ends_at: number;
  phone: string | null;
  email: string | null;
  note: string | null;
  status: BookingStatus;
  created_at: number;
}

// Covers already booked in one area on a date whose sitting overlaps a window: one that
// starts before the window ends and ends after it starts. D1 takes numbered parameters,
// so the caller says which parameter holds the date, the area, the window's end and its
// start.
const overlappingCovers = (
  date: number,
  area: number,
  endsAt: number,
  startsAt: number,
) => `
  COALESCE((
    SELECT SUM(party_size) FROM bookings
    WHERE date = ?${date} AND area = ?${area} AND starts_at < ?${endsAt} AND ?${startsAt} < ends_at
  ), 0)`;

/**
 * Bookings in Cloudflare D1. The capacity check in `reserve` is one SQL statement: an
 * INSERT whose SELECT produces a row only while the party still fits in its area. SQLite
 * runs a statement atomically under the database's single write lock, so two visitors
 * taking the last covers in the same area at the same moment cannot both see room; the
 * second INSERT evaluates its subquery after the first has committed and inserts nothing.
 * The subquery is keyed on the slot and the area together, so an inside booking never
 * consumes an outside seat.
 */
export class D1BookingStore implements BookingStore {
  private readonly db: D1Like;

  constructor(db: D1Like) {
    this.db = db;
  }

  async coversDuring(
    date: string,
    startsAt: Date,
    endsAt: Date,
    area: Area,
  ): Promise<number> {
    const row = await this.db
      .prepare(`SELECT ${overlappingCovers(1, 2, 3, 4)} AS covers`)
      .bind(date, area, endsAt.getTime(), startsAt.getTime())
      .first<{ covers: number }>();
    return row?.covers ?? 0;
  }

  async reserve(request: ReserveRequest, capacity: number): Promise<ReserveResult> {
    const id = `bk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = new Date();
    const { slot } = request;
    const result = await this.db
      .prepare(
        `INSERT INTO bookings
           (id, name, party_size, area, date, time, starts_at, ends_at, phone, email, note, status, created_at)
         SELECT ?1, ?2, ?3, ?14, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12
         WHERE ?3 + ${overlappingCovers(4, 14, 7, 6)} <= ?13`,
      )
      .bind(
        id,
        request.name,
        request.partySize,
        slot.date,
        slot.time,
        slot.startsAt.getTime(),
        slot.endsAt.getTime(),
        request.contact.phone ?? null,
        request.contact.email ?? null,
        request.note ?? null,
        request.status,
        createdAt.getTime(),
        capacity,
        request.area,
      )
      .run();

    if (result.meta.changes === 1) {
      return { ok: true, booking: { ...request, id, createdAt } };
    }
    const used = await this.coversDuring(
      slot.date,
      slot.startsAt,
      slot.endsAt,
      request.area,
    );
    return { ok: false, reason: "full", remaining: Math.max(0, capacity - used) };
  }

  async list(date: string): Promise<BookingRecord[]> {
    const { results } = await this.db
      .prepare(`SELECT * FROM bookings WHERE date = ?1 ORDER BY starts_at, created_at`)
      .bind(date)
      .all<Row>();
    return results.map(fromRow);
  }
}

function fromRow(row: Row): BookingRecord {
  const slot: Slot = {
    date: row.date,
    time: row.time,
    startsAt: new Date(row.starts_at),
    endsAt: new Date(row.ends_at),
  };
  return {
    id: row.id,
    name: row.name,
    partySize: row.party_size,
    area: row.area,
    slot,
    contact: {
      ...(row.phone ? { phone: row.phone } : {}),
      ...(row.email ? { email: row.email } : {}),
    },
    ...(row.note ? { note: row.note } : {}),
    status: row.status,
    createdAt: new Date(row.created_at),
  };
}
