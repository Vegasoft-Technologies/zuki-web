// Imported by relative path rather than through the "@/" alias so that this module and
// its tests run under Node's built-in test runner, which has no knowledge of the
// TypeScript path mapping.
import { TIMEZONE, formatTime, openingHours } from "../data/openingHours.ts";

export interface OpeningStatus {
  isOpen: boolean;
  /** The part after the status word: "until 17:00 today", "opens 09:00 tomorrow". */
  detail: string;
  /**
   * While the café is open, whether food is still served: "kitchen until 16:00" or
   * "kitchen closed for today". Absent when the café is closed, and on a day the
   * kitchen and the café close together.
   */
  kitchen?: string;
  /** The day in London. 0 is Sunday, matching Date#getDay. */
  dayIndex: number;
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

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/**
 * The day and time in London, whatever the visitor's own clock says. Read through
 * Intl rather than by adding a fixed offset, so British Summer Time is handled.
 */
function londonClock(now: Date): { dayIndex: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  // Some implementations render midnight as hour 24.
  const hour = Number(value("hour")) % 24;

  return {
    dayIndex: WEEKDAY_INDEX[value("weekday")] ?? now.getDay(),
    minutes: hour * 60 + Number(value("minute")),
  };
}

/** Which day it is in London. Used to mark today's row in the opening hours table. */
export function getLondonDayIndex(now: Date): number {
  return londonClock(now).dayIndex;
}

/**
 * Pure. Takes the moment to report on and returns the status, so it can be tested
 * without rendering anything.
 */
export function getOpeningStatus(now: Date): OpeningStatus {
  const { dayIndex, minutes } = londonClock(now);
  const today = openingHours.find((day) => day.day === dayIndex);

  if (today && minutes >= today.opens && minutes < today.closes) {
    const status: OpeningStatus = {
      isOpen: true,
      detail: `until ${formatTime(today.closes)} today`,
      dayIndex,
    };
    if (today.kitchenCloses < today.closes) {
      status.kitchen =
        minutes < today.kitchenCloses
          ? `kitchen until ${formatTime(today.kitchenCloses)}`
          : "kitchen closed for today";
    }
    return status;
  }

  if (today && minutes < today.opens) {
    return {
      isOpen: false,
      detail: `opens ${formatTime(today.opens)} today`,
      dayIndex,
    };
  }

  for (let ahead = 1; ahead <= 7; ahead += 1) {
    const day = (dayIndex + ahead) % 7;
    const next = openingHours.find((entry) => entry.day === day);
    if (!next) continue;
    const when = ahead === 1 ? "tomorrow" : DAY_NAMES[day];
    return {
      isOpen: false,
      detail: `opens ${formatTime(next.opens)} ${when}`,
      dayIndex,
    };
  }

  return { isOpen: false, detail: "", dayIndex };
}
