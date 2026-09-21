import { openingHours, formatTime, type DayHours } from "../../data/openingHours.ts";
import type { BookingRules } from "./config.ts";
import {
  addDays,
  dateString,
  londonDateString,
  londonToInstant,
  parseDate,
  parseTime,
  weekdayOf,
  type DateParts,
} from "./time.ts";

export interface Slot {
  date: string;
  time: string;
  startsAt: Date;
  endsAt: Date;
}

export type SlotProblem =
  | "invalid-date"
  | "invalid-time"
  | "closed-that-day"
  | "outside-hours"
  | "not-a-slot-time"
  | "too-soon"
  | "too-far-ahead";

export type SlotCheck = { ok: true; slot: Slot } | { ok: false; problem: SlotProblem };

/** The opening hours for a date, derived from the single source of truth. */
export function hoursFor(date: DateParts): DayHours | undefined {
  const weekday = weekdayOf(date);
  return openingHours.find((d) => d.day === weekday);
}

/**
 * Every slot start time on a date, in minutes past midnight, ignoring notice and window.
 * The last bookable slot is the latest one whose sitting finishes before the kitchen
 * closes, so a guest never sits down to find no food (docs/decisions/0007).
 */
export function daySlotTimes(date: DateParts, rules: BookingRules): number[] {
  const hours = hoursFor(date);
  if (!hours) return [];
  return slotTimesFor(hours, rules);
}

function slotTimesFor(hours: DayHours, rules: BookingRules): number[] {
  const times: number[] = [];
  for (
    let t = hours.opens;
    t + rules.sittingMinutes <= hours.kitchenCloses;
    t += rules.slotIntervalMinutes
  ) {
    times.push(t);
  }
  return times;
}

/** The last date the calendar is open to, as YYYY-MM-DD. */
export function lastBookableDate(now: Date, rules: BookingRules): string {
  const today = parseDate(londonDateString(now));
  if (!today)
    throw new Error("unreachable: londonDateString always produces a valid date");
  return dateString(addDays(today, rules.bookingWindowDays));
}

export function checkSlot(
  dateValue: string,
  timeValue: string,
  rules: BookingRules,
  now: Date,
): SlotCheck {
  const date = parseDate(dateValue);
  if (!date) return { ok: false, problem: "invalid-date" };
  const minutes = parseTime(timeValue);
  if (minutes === null) return { ok: false, problem: "invalid-time" };

  const hours = hoursFor(date);
  if (!hours) return { ok: false, problem: "closed-that-day" };

  const times = daySlotTimes(date, rules);
  if (minutes < hours.opens || minutes > times[times.length - 1]) {
    return { ok: false, problem: "outside-hours" };
  }
  if (!times.includes(minutes)) return { ok: false, problem: "not-a-slot-time" };

  if (dateValue > lastBookableDate(now, rules))
    return { ok: false, problem: "too-far-ahead" };

  const startsAt = londonToInstant(date.year, date.month, date.day, minutes);
  if (startsAt.getTime() < now.getTime() + rules.minNoticeMinutes * 60_000) {
    return { ok: false, problem: "too-soon" };
  }

  return {
    ok: true,
    slot: {
      date: dateValue,
      time: formatTime(minutes),
      startsAt,
      endsAt: new Date(startsAt.getTime() + rules.sittingMinutes * 60_000),
    },
  };
}

/** The slots on a date that can still be booked now. */
export function availableSlots(
  dateValue: string,
  rules: BookingRules,
  now: Date,
): Slot[] {
  const date = parseDate(dateValue);
  if (!date) return [];
  return daySlotTimes(date, rules)
    .map((t) => checkSlot(dateValue, formatTime(t), rules, now))
    .filter((c): c is { ok: true; slot: Slot } => c.ok)
    .map((c) => c.slot);
}

/**
 * Every start time that occurs on any day of the week. Used for the time menu when the
 * page runs without scripting and cannot ask which date was chosen; the server still
 * rejects a time that is not valid for the chosen date.
 */
export function templateTimes(rules: BookingRules): string[] {
  const set = new Set<number>();
  for (const day of openingHours) for (const t of slotTimesFor(day, rules)) set.add(t);
  return [...set].sort((a, b) => a - b).map(formatTime);
}

export function describeProblem(problem: SlotProblem, rules: BookingRules): string {
  switch (problem) {
    case "invalid-date":
      return "Please choose a date.";
    case "invalid-time":
      return "Please choose a time.";
    case "closed-that-day":
      return "We are closed that day.";
    case "outside-hours":
      return "That time is outside the hours we take bookings for — the last sitting starts before the kitchen closes.";
    case "not-a-slot-time":
      return `Bookings start every ${rules.slotIntervalMinutes} minutes — please pick one of the listed times.`;
    case "too-soon":
      return `We need at least ${rules.minNoticeMinutes} minutes' notice — for anything sooner, please telephone.`;
    case "too-far-ahead":
      return `The calendar is open ${rules.bookingWindowDays} days ahead.`;
  }
}
