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
}

const hm = (hours: number, minutes: number) => hours * 60 + minutes;

export const openingHours: DayHours[] = [
  { day: 1, label: "Monday", opens: hm(8, 0), closes: hm(17, 0) },
  { day: 2, label: "Tuesday", opens: hm(8, 0), closes: hm(17, 0) },
  { day: 3, label: "Wednesday", opens: hm(8, 0), closes: hm(17, 0) },
  { day: 4, label: "Thursday", opens: hm(8, 0), closes: hm(17, 0) },
  { day: 5, label: "Friday", opens: hm(8, 0), closes: hm(17, 0) },
  { day: 6, label: "Saturday", opens: hm(9, 0), closes: hm(17, 0) },
  { day: 0, label: "Sunday", opens: hm(10, 0), closes: hm(16, 0) },
];

export const TIMEZONE = "Europe/London";

/** "08:00", from minutes past midnight. */
export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "08:00 \u2013 17:00", exactly as the hours table prints it. */
export function formatRange(day: DayHours): string {
  return `${formatTime(day.opens)} \u2013 ${formatTime(day.closes)}`;
}
