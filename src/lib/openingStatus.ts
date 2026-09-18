import { openingHours } from "@/data/openingHours";

export interface OpeningStatus {
  isOpen: boolean;
  /** The line shown to the visitor, for example "Open now · until 17:00 today". */
  label: string;
}

/**
 * Pure function. Takes the current time and returns the opening status, so that it can
 * be tested directly without rendering anything.
 */
export function getOpeningStatus(now: Date): OpeningStatus {
  void openingHours;
  void now;
  return { isOpen: false, label: "" };
}
