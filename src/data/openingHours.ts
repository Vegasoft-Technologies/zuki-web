/**
 * Opening hours for each day of the week, evaluated in the Europe/London timezone.
 * The index matches JavaScript's Date#getDay: 0 is Sunday.
 */
export interface DayHours {
  /** 0 = Sunday, through 6 = Saturday. */
  day: number;
  label: string;
  /** Minutes from midnight. */
  opens: number;
  closes: number;
  /** When the kitchen stops serving food; the café stays open until `closes`. */
  kitchenCloses: number;
}

const hm = (hours: number, minutes: number) => hours * 60 + minutes;

// The kitchen's cut-off, confirmed by the café on 2026-09-21: 16:00 Monday to Friday,
// 15:00 on Saturday and Sunday. The café itself stays open later; see `closes`.
const weekdayKitchen = hm(16, 0);
const weekendKitchen = hm(15, 0);

export const openingHours: DayHours[] = [
  {
    day: 1,
    label: "Monday",
    opens: hm(8, 0),
    closes: hm(17, 0),
    kitchenCloses: weekdayKitchen,
  },
  {
    day: 2,
    label: "Tuesday",
    opens: hm(8, 0),
    closes: hm(17, 0),
    kitchenCloses: weekdayKitchen,
  },
  {
    day: 3,
    label: "Wednesday",
    opens: hm(8, 0),
    closes: hm(17, 0),
    kitchenCloses: weekdayKitchen,
  },
  {
    day: 4,
    label: "Thursday",
    opens: hm(8, 0),
    closes: hm(17, 0),
    kitchenCloses: weekdayKitchen,
  },
  {
    day: 5,
    label: "Friday",
    opens: hm(8, 0),
    closes: hm(17, 0),
    kitchenCloses: weekdayKitchen,
  },
  {
    day: 6,
    label: "Saturday",
    opens: hm(9, 0),
    closes: hm(17, 0),
    kitchenCloses: weekendKitchen,
  },
  {
    day: 0,
    label: "Sunday",
    opens: hm(10, 0),
    closes: hm(16, 0),
    kitchenCloses: weekendKitchen,
  },
];

export const TIMEZONE = "Europe/London";

/** "08:00", from minutes past midnight. */
export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "4pm" or "4:30pm", the way the menu note writes a time. */
export function formatClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}${m ? `:${String(m).padStart(2, "0")}` : ""}${h < 12 ? "am" : "pm"}`;
}

/**
 * The kitchen cut-off as the menu note prints it, from the same figures the table uses:
 * "4pm" when every day is the same, otherwise each time with its days, in week order, for
 * example "4pm Monday to Friday and 3pm Saturday and Sunday".
 */
export function describeKitchenHours(): string {
  const week = [1, 2, 3, 4, 5, 6, 0]
    .map((day) => openingHours.find((d) => d.day === day))
    .filter((d): d is DayHours => d !== undefined);
  const runs: { time: number; days: string[] }[] = [];
  for (const day of week) {
    const last = runs[runs.length - 1];
    if (last && last.time === day.kitchenCloses) last.days.push(day.label);
    else runs.push({ time: day.kitchenCloses, days: [day.label] });
  }
  if (runs.length === 1) return formatClock(runs[0].time);
  const span = (days: string[]) =>
    days.length === 1
      ? days[0]
      : days.length === 2
        ? `${days[0]} and ${days[1]}`
        : `${days[0]} to ${days[days.length - 1]}`;
  return runs.map((run) => `${formatClock(run.time)} ${span(run.days)}`).join(" and ");
}

/** "08:00 \u2013 17:00", exactly as the hours table prints it. */
export function formatRange(day: DayHours): string {
  return `${formatTime(day.opens)} \u2013 ${formatTime(day.closes)}`;
}
