import { BASELINE, STAGE_NAMES, resolveAdd, resolveReason, rules } from "../content/rules";
import type { Requirements } from "../content/types";

/** One pain and the components it forces, inside a stage. */
export type Step = {
  /** The pain that shows up. */
  bottleneck: string;
  /** Why these components answer it, quoting the requirement that decided it. */
  reason: string;
  /** Components this step brings in. Never empty. */
  added: string[];
};

export type Stage = {
  title: string;
  bottleneck: string;
  added: string[];
  reasons: string[];
  /** The stage split into its separate pains, in rule order. */
  steps: Step[];
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
    // Each rule keeps only the components nothing earlier has brought in, so a
    // component is credited to the first pain that needs it.
    const steps: Step[] = [];
    for (const rule of group) {
      const added = [...new Set(resolveAdd(rule, r))].filter((id) => !present.has(id));
      if (added.length === 0) continue;
      added.forEach((id) => present.add(id));
      steps.push({ bottleneck: rule.bottleneck, reason: resolveReason(rule, r), added });
    }
    const added = steps.flatMap((step) => step.added);
    // A stage whose components already exist adds nothing new to show.
    if (stage !== 0 && added.length === 0) continue;
    stages.push({
      title: STAGE_NAMES[stage] ?? `Stage ${stages.length}`,
      bottleneck: [...new Set(group.map((rule) => rule.bottleneck))].join(" "),
      added,
      reasons: [...new Set(group.map((rule) => resolveReason(rule, r)))],
      steps,
      components: [...present],
    });
  }
  return stages;
}
