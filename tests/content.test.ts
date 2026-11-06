import { describe, expect, it } from "vitest";
import { componentList, components } from "../src/content/components";
import { glossary } from "../src/content/glossary";
import { BASELINE, resolveAdd, rules } from "../src/content/rules";
import { tensions } from "../src/content/tensions";
import { defaultRequirements } from "../src/engine/recommend";
import { scenarios } from "../src/content/scenarios";

describe("content", () => {
  it("has unique component IDs", () => {
    expect(new Set(componentList.map((c) => c.id)).size).toBe(componentList.length);
  });

  for (const c of componentList) {
    describe(c.name, () => {
      it("fills in every field", () => {
        for (const field of ["name", "oneLiner", "howItWorks", "interviewAngle"] as const) {
          expect(c[field].trim(), field).not.toBe("");
        }
        expect(c.addWhen.length).toBeGreaterThan(0);
        expect(c.skipWhen.length).toBeGreaterThan(0);
        expect(c.tradeoffs.length).toBeGreaterThan(0);
        expect(c.tools.length).toBeGreaterThan(0);
      });

      it("cites at least one https source", () => {
        expect(c.sources.length).toBeGreaterThan(0);
        for (const s of c.sources) expect(s.url).toMatch(/^https:\/\//);
      });

      it("links only to components and glossary terms that exist", () => {
        for (const id of c.related) expect(components, `related: ${id}`).toHaveProperty(id);
        for (const key of c.glossary) expect(glossary, `glossary: ${key}`).toHaveProperty(key);
      });
    });
  }

  it("rules, baseline and scenarios only reference existing components", () => {
    const shapes = ["relational", "key-value", "document", "graph"] as const;
    const referenced = [
      ...rules.flatMap((rule) => shapes.flatMap((dataShape) => resolveAdd(rule, { ...defaultRequirements, dataShape }))),
      ...BASELINE.map((b) => b.id),
      ...scenarios.flatMap((s) => s.expected.components),
    ];
    for (const id of referenced) expect(components, id).toHaveProperty(id);
  });

  it("tension concepts are glossary terms", () => {
    for (const t of tensions) for (const key of t.concepts) expect(glossary, `${t.id}: ${key}`).toHaveProperty(key);
  });

  it("every component is reachable from some requirement", () => {
    const reachable = new Set([
      ...BASELINE.map((b) => b.id),
      ...rules.flatMap((rule) =>
        (["relational", "key-value", "document", "graph"] as const).flatMap((dataShape) =>
          resolveAdd(rule, { ...defaultRequirements, dataShape }),
        ),
      ),
    ]);
    for (const c of componentList) expect(reachable, c.id).toContain(c.id);
  });

  it("has unique rule IDs", () => {
    expect(new Set(rules.map((r) => r.id)).size).toBe(rules.length);
  });
});
