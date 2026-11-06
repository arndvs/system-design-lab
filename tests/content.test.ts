import { describe, expect, it } from "vitest";
import { componentList, components } from "../src/content/components";
import { glossary } from "../src/content/glossary";
import { BASELINE, rules } from "../src/content/rules";
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
    const referenced = [...rules.flatMap((r) => r.add), ...BASELINE, ...scenarios.flatMap((s) => s.expected)];
    for (const id of referenced) expect(components, id).toHaveProperty(id);
  });

  it("has unique rule IDs", () => {
    expect(new Set(rules.map((r) => r.id)).size).toBe(rules.length);
  });
});
