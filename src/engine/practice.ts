import { components } from "../content/components";
import type { Scenario } from "../content/scenarios";
import type { Topology } from "../content/types";
import { recommend } from "./recommend";

export type Attempt = { components: string[]; topology: Topology | null };

export type Grade = {
  /** Picked and in the reference answer. */
  right: string[];
  /** In the reference answer but not picked, with the reason the brief calls for it. */
  missed: { id: string; reason: string }[];
  /** Picked but not in the reference answer, with when it is usually left out. */
  extra: { id: string; skipWhen: string }[];
  topology: { picked: Topology | null; expected: Topology; right: boolean; reason: string };
  /** Reference components matched, out of how many there are. */
  score: { matched: number; of: number };
  /** True when the components and the topology both match exactly. */
  perfect: boolean;
};

/**
 * Compares an attempt with the scenario's reference answer. The reasons come
 * from the same engine as the Build view, run on the scenario's requirements.
 */
export function grade(scenario: Scenario, attempt: Attempt): Grade {
  const rec = recommend(scenario.requirements);
  const expected = scenario.expected.components;
  const picked = new Set(attempt.components);
  const right = expected.filter((id) => picked.has(id));
  const missed = expected
    .filter((id) => !picked.has(id))
    .map((id) => ({ id, reason: rec.components[id]?.[0]?.text ?? "" }));
  const extra = attempt.components
    .filter((id) => !expected.includes(id))
    .map((id) => ({ id, skipWhen: components[id]?.skipWhen[0] ?? "" }));
  const topologyRight = attempt.topology === scenario.expected.topology;
  return {
    right,
    missed,
    extra,
    topology: {
      picked: attempt.topology,
      expected: scenario.expected.topology,
      right: topologyRight,
      reason: rec.topology.reason,
    },
    score: { matched: right.length, of: expected.length },
    perfect: missed.length === 0 && extra.length === 0 && topologyRight,
  };
}

export type Drill = { question: string; answer: string[] };

/**
 * Questions an interviewer could ask about one component of a scenario's
 * reference design. Every answer is taken from existing content: the engine's
 * reasons and the component's own entry.
 */
export function drills(scenario: Scenario, id: string): Drill[] {
  const c = components[id]!;
  const reasons = recommend(scenario.requirements).components[id]?.map((r) => r.text) ?? [];
  return [
    { question: "Why is it in this design?", answer: reasons },
    {
      question: "What does it cost you, and how do you contain that?",
      answer: c.tradeoffs.map((t) => `${t.cost} Usual fix: ${t.mitigation}`),
    },
    { question: "When would you leave it out?", answer: c.skipWhen },
    { question: "What is the interviewer likely to push on?", answer: [c.interviewAngle] },
  ];
}
