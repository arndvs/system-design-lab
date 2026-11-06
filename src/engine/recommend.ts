import { componentOrder } from "../content/components";
import { BASELINE, resolveAdd, resolveReason, rules, topology } from "../content/rules";
import { tensions } from "../content/tensions";
import type { Reason, Requirements, Topology } from "../content/types";

export type Recommendation = {
  /** Component ID → every reason it was added, in display order. */
  components: Record<string, Reason[]>;
  topology: { level: Topology; reason: string };
  tensions: { id: string; title: string; explain: string; options: string[]; concepts: string[] }[];
};

export const defaultRequirements: Requirements = {
  dataShape: "relational",
  userAccounts: false,
  mediaUploads: false,
  fullTextSearch: false,
  asyncWork: false,
  realtimeAnalytics: false,
  reporting: false,
  microservices: false,
  serviceCount: 8,
  independentTeams: 1,
  unevenScaling: false,
  opsMaturity: "limited",

  peakRps: 100,
  readWriteRatio: 5,
  availability: 99.9,
  latencyMs: 300,
  consistency: "eventual",
  globalUsers: false,
  sensitiveData: false,
};

/** Pure function: requirements in, components with reasons, topology and tensions out. */
export function recommend(r: Requirements): Recommendation {
  const found: Record<string, Reason[]> = {};
  const add = (id: string, reason: Reason) => {
    const reasons = (found[id] ??= []);
    if (!reasons.some((x) => x.text === reason.text)) reasons.push(reason);
  };

  for (const { id, reason } of BASELINE) add(id, { text: reason, driver: "baseline" });
  for (const rule of rules) {
    if (!rule.when(r)) continue;
    const reason: Reason = { text: resolveReason(rule, r), driver: rule.driver };
    for (const id of resolveAdd(rule, r)) add(id, reason);
  }

  const components = Object.fromEntries(
    Object.entries(found).sort(([a], [b]) => (componentOrder[a] ?? 99) - (componentOrder[b] ?? 99)),
  );

  return {
    components,
    topology: topology(r),
    tensions: tensions
      .filter((t) => t.when(r))
      .map((t) => ({
        id: t.id,
        title: t.title,
        explain: typeof t.explain === "function" ? t.explain(r) : t.explain,
        options: t.options,
        concepts: t.concepts,
      })),
  };
}

/** What changed between two recommendations, for the "what changed" list. */
export function diff(before: Recommendation, after: Recommendation) {
  const b = before.components;
  const a = after.components;
  return {
    added: Object.keys(a).filter((id) => !(id in b)),
    removed: Object.keys(b).filter((id) => !(id in a)),
  };
}

