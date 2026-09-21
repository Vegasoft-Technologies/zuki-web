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

/**
 * The kitchen's cut-off, taken from the menu note "Full menu served all day till 4pm".
 * One value for every day until the café says otherwise; Sunday closes at 16:00, so
 * there the kitchen and the café close together.
 */
const kitchenCloses = hm(16, 0);

export const openingHours: DayHours[] = [
  { day: 1, label: "Monday", opens: hm(8, 0), closes: hm(17, 0), kitchenCloses },
  { day: 2, label: "Tuesday", opens: hm(8, 0), closes: hm(17, 0), kitchenCloses },
  { day: 3, label: "Wednesday", opens: hm(8, 0), closes: hm(17, 0), kitchenCloses },
  { day: 4, label: "Thursday", opens: hm(8, 0), closes: hm(17, 0), kitchenCloses },
  { day: 5, label: "Friday", opens: hm(8, 0), closes: hm(17, 0), kitchenCloses },
  { day: 6, label: "Saturday", opens: hm(9, 0), closes: hm(17, 0), kitchenCloses },
  { day: 0, label: "Sunday", opens: hm(10, 0), closes: hm(16, 0), kitchenCloses },
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

/** The kitchen cut-off as the menu note prints it, from the same figure the table uses. */
export const kitchenCutoffNote = formatClock(kitchenCloses);

/** "08:00 \u2013 17:00", exactly as the hours table prints it. */
export function formatRange(day: DayHours): string {
  return `${formatTime(day.opens)} \u2013 ${formatTime(day.closes)}`;
}
