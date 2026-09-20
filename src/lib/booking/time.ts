// Everything the booking system does with time happens in London, whatever clock the
// server or the visitor runs on. Imports are by relative path with extensions so that
// this module and its tests run under Node's built-in test runner.
import { TIMEZONE } from "../../data/openingHours.ts";

const WEEKDAY: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIMEZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  weekday: "short",
});

export interface LondonClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  /** 0 is Sunday, matching Date#getDay. */
  weekday: number;
}

/** The wall clock in London at a given instant. */
export function londonClock(at: Date): LondonClock {
  const p: Record<string, string> = {};
  for (const part of formatter.formatToParts(at)) p[part.type] = part.value;
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour) % 24,
    minute: Number(p.minute),
    second: Number(p.second),
    weekday: WEEKDAY[p.weekday] ?? at.getUTCDay(),
  };
}

/** Minutes London is ahead of UTC at that instant: 0 in winter, 60 in summer. */
export function londonOffsetMinutes(at: Date): number {
  const c = londonClock(at);
  const asUtc = Date.UTC(c.year, c.month - 1, c.day, c.hour, c.minute, c.second);
  return Math.round((asUtc - at.getTime()) / 60_000);
}

/**
 * The instant at which a London wall-clock time occurs. Handles the clocks going
 * forward and back by checking the offset twice, once on either side of the change.
 */
export function londonToInstant(
  year: number,
  month: number,
  day: number,
  minutesOfDay: number,
): Date {
  const guess = Date.UTC(year, month - 1, day, 0, minutesOfDay);
  const first = londonOffsetMinutes(new Date(guess));
  let instant = guess - first * 60_000;
  const second = londonOffsetMinutes(new Date(instant));
  if (second !== first) instant = guess - second * 60_000;
  return new Date(instant);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "YYYY-MM-DD" for the London date at that instant. */
export function londonDateString(at: Date): string {
  const c = londonClock(at);
  return `${c.year}-${pad(c.month)}-${pad(c.day)}`;
}

export interface DateParts {
  year: number;
  month: number;
  day: number;
}

/** Accepts only a real calendar date written YYYY-MM-DD. */
export function parseDate(value: string): DateParts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

/** "HH:MM" on a 24-hour clock, as minutes past midnight. */
export function parseTime(value: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

export function addDays(date: DateParts, days: number): DateParts {
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

export function dateString(d: DateParts): string {
  return `${d.year}-${pad(d.month)}-${pad(d.day)}`;
}

/** Which day of the week a London date falls on. */
export function weekdayOf(d: DateParts): number {
  return londonClock(londonToInstant(d.year, d.month, d.day, 12 * 60)).weekday;
}
