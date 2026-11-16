import { components } from "../content/components";
import { glossary } from "../content/glossary";
import { BASELINE, resolveAdd, rules } from "../content/rules";
import { scenarios } from "../content/scenarios";
import { shapeEntries } from "../content/shape-entries";
import type { Requirements } from "../content/types";
import { defaultRequirements } from "./recommend";

// Some rules choose what to add from the requirements (the primary store
// follows the data's shape). Probing each data shape finds everything such a
// rule can add.
const PROBES: Requirements[] = (["relational", "key-value", "document", "graph"] as const).map((dataShape) => ({
  ...defaultRequirements,
  dataShape,
}));

export type Usage = {
  /** In every design, whatever the requirements. */
  baseline: boolean;
  /** The pains that can bring this component in, from the rules. */
  pains: string[];
  /** Practice scenarios whose reference design includes it. */
  scenarios: { id: string; title: string }[];
};

/** Where a component comes from: the rules that can add it and the scenarios that use it. */
export function usage(id: string): Usage {
  const pains = rules
    .filter((rule) => PROBES.some((probe) => resolveAdd(rule, probe).includes(id)))
    .map((rule) => rule.bottleneck);
  return {
    baseline: BASELINE.some((b) => b.id === id),
    pains: [...new Set(pains)],
    scenarios: scenarios.filter((s) => s.expected.components.includes(id)).map((s) => ({ id: s.id, title: s.title })),
  };
}

export type SearchResult = { components: string[]; shapes: string[]; terms: string[] };

const has = (query: string, ...texts: (string | string[])[]) => {
  const q = query.trim().toLowerCase();
  return q === "" || texts.flat().some((t) => t.toLowerCase().includes(q));
};

/** Everything whose text contains the query. An empty query matches everything. */
export function search(query: string): SearchResult {
  return {
    components: Object.values(components)
      .filter((c) =>
        has(
          query,
          c.name,
          c.oneLiner,
          c.howItWorks,
          c.addWhen,
          c.skipWhen,
          c.interviewAngle,
          c.tradeoffs.flatMap((t) => [t.cost, t.mitigation]),
          c.tools.map((t) => t.name),
          c.glossary.map((key) => glossary[key]?.term ?? ""),
        ),
      )
      .map((c) => c.id),
    shapes: shapeEntries
      .filter((s) => has(query, s.name, s.oneLiner, s.addWhen, s.skipWhen, s.interviewAngle))
      .map((s) => s.id),
    terms: Object.entries(glossary)
      .filter(([, g]) => has(query, g.term, g.definition))
      .map(([key]) => key),
  };
}
