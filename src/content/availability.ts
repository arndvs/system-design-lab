import type { Availability } from "./types";

const MINUTES_PER_YEAR = 365.25 * 24 * 60;

/** Allowed downtime per year for an availability target, in minutes. */
export const downtimeMinutesPerYear = (a: Availability) => MINUTES_PER_YEAR * (1 - a / 100);

/** Human-readable downtime budget, e.g. "8.8 hours". */
export function downtimeLabel(a: Availability): string {
  const min = downtimeMinutesPerYear(a);
  if (min >= 2 * 24 * 60) return `${(min / (24 * 60)).toFixed(1)} days`;
  if (min >= 120) return `${(min / 60).toFixed(1)} hours`;
  return `${Math.round(min)} minutes`;
}
