import { BASELINE, BASELINE_REASON, resolveReason, rules } from "../content/rules";
import type { Requirements } from "../content/types";

export type Recommendation = Record<string, string[]>;

export const defaultRequirements: Requirements = {
  peakRps: 100,
  readWriteRatio: 5,
  dataShape: "relational",
  strongConsistency: false,
  highAvailability: false,
  globalUsers: false,
  lowLatency: false,
  eventDriven: false,
  mediaUploads: false,
};

/** Pure function: requirements in, component IDs with the reasons for each out. */
export function recommend(r: Requirements): Recommendation {
  const out: Recommendation = {};
  const add = (id: string, reason: string) => {
    const reasons = (out[id] ??= []);
    if (!reasons.includes(reason)) reasons.push(reason);
  };
  for (const rule of rules) {
    if (!rule.when(r)) continue;
    const reason = resolveReason(rule, r);
    for (const id of rule.add) add(id, reason);
  }
  for (const id of BASELINE) add(id, BASELINE_REASON);
  return out;
}

/** What changed between two recommendations, for the "what changed" list. */
export function diff(before: Recommendation, after: Recommendation) {
  const added = Object.keys(after).filter((id) => !(id in before));
  const removed = Object.keys(before).filter((id) => !(id in after));
  return { added, removed };
}
