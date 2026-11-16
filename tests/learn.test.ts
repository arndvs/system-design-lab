import { describe, expect, it } from "vitest";
import { components } from "../src/content/components";
import { glossary } from "../src/content/glossary";
import { shapeEntries } from "../src/content/shape-entries";
import { search, usage } from "../src/engine/learn";

describe("usage", () => {
  it("finds where every component comes from: the baseline or at least one rule", () => {
    for (const id of Object.keys(components)) {
      const u = usage(id);
      expect(u.baseline || u.pains.length > 0, `${id} is not in the baseline and no rule adds it`).toBe(true);
    }
  });

  it("marks the baseline and lists the pains that add a component", () => {
    expect(usage("app-servers").baseline).toBe(true);
    expect(usage("cache")).toMatchObject({ baseline: false });
    expect(usage("cache").pains).toContain("The database spends most of its time answering the same reads.");
  });

  it("finds a store that a rule only adds for one data shape", () => {
    expect(usage("graph-database").pains.length).toBeGreaterThan(0);
  });

  it("lists the practice scenarios that use a component", () => {
    expect(usage("key-value-store").scenarios.map((s) => s.id)).toContain("url-shortener");
  });
});

describe("search", () => {
  it("returns everything for an empty query", () => {
    const all = search("  ");
    expect(all.components).toHaveLength(Object.keys(components).length);
    expect(all.shapes).toHaveLength(shapeEntries.length);
    expect(all.terms).toHaveLength(Object.keys(glossary).length);
  });

  it("matches a component by name, by tool and by one of its terms, ignoring case", () => {
    expect(search("CACHE").components).toContain("cache");
    expect(search("elasticache").components).toEqual(["cache"]);
    expect(search("thundering herd").components).toContain("cache");
  });

  it("matches glossary terms and shapes", () => {
    expect(search("cap theorem").terms).toContain("cap-theorem");
    expect(search("modular monolith").shapes).toContain("modular-monolith");
  });

  it("returns nothing for text that is not there", () => {
    expect(search("zzzz-not-a-thing")).toEqual({ components: [], shapes: [], terms: [] });
  });
});
