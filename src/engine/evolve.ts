import { BASELINE, resolveAdd, resolveReason, rules } from "../content/rules";
import type { Requirements } from "../content/types";

export type Stage = {
  title: string;
  bottleneck: string;
  added: string[];
  reasons: string[];
  /** Everything present once this stage is done. */
  components: string[];
};

/**
 * Replays the design as a growth story: a single server first, then one stage
 * per bottleneck the requirements will hit, in rule-stage order.
 */
export function evolve(r: Requirements): Stage[] {
  const present = new Set<string>(BASELINE.map((b) => b.id));
  const stages: Stage[] = [];
  const fired = rules.filter((rule) => rule.when(r));

  const byStage = new Map<number, typeof fired>();
  for (const rule of fired) byStage.set(rule.stage, [...(byStage.get(rule.stage) ?? []), rule]);

  for (const [stage, group] of [...byStage.entries()].sort(([a], [b]) => a - b)) {
    const added = [...new Set(group.flatMap((rule) => resolveAdd(rule, r)))].filter((id) => !present.has(id));
    // A stage whose components already exist adds nothing new to show.
    if (stage !== 0 && added.length === 0) continue;
    added.forEach((id) => present.add(id));
    stages.push({
      title: stage === 0 ? "Single server" : `Stage ${stages.length}`,
      bottleneck: [...new Set(group.map((rule) => rule.bottleneck))].join(" "),
      added,
      reasons: [...new Set(group.map((rule) => resolveReason(rule, r)))],
      components: [...present],
    });
  }
  return stages;
}
