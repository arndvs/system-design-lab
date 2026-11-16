import { describe, expect, it } from "vitest";
import { components } from "../src/content/components";
import { scenarios } from "../src/content/scenarios";
import { drills, grade } from "../src/engine/practice";

describe("grade", () => {
  it("calls the reference answer a perfect match, for every scenario", () => {
    for (const s of scenarios) {
      const g = grade(s, { components: s.expected.components, topology: s.expected.topology });
      expect(g.perfect, s.id).toBe(true);
      expect(g.score).toEqual({ matched: s.expected.components.length, of: s.expected.components.length });
      expect(g.missed).toEqual([]);
      expect(g.extra).toEqual([]);
    }
  });

  it("explains every missed part with the reason the brief calls for it", () => {
    for (const s of scenarios) {
      const g = grade(s, { components: [], topology: null });
      expect(g.missed.map((m) => m.id)).toEqual(s.expected.components);
      for (const m of g.missed) expect(m.reason, `${s.id}: ${m.id}`).toBeTruthy();
      expect(g.topology.right).toBe(false);
      expect(g.perfect).toBe(false);
    }
  });

  it("flags parts the brief does not call for, with when they are skipped", () => {
    const s = scenarios.find((x) => x.id === "url-shortener")!;
    const g = grade(s, { components: [...s.expected.components, "service-mesh"], topology: s.expected.topology });
    expect(g.extra).toEqual([{ id: "service-mesh", skipWhen: components["service-mesh"]!.skipWhen[0] }]);
    expect(g.score.matched).toBe(s.expected.components.length);
    expect(g.perfect).toBe(false);
  });

  it("marks the placement wrong on its own", () => {
    const s = scenarios.find((x) => x.id === "url-shortener")!;
    const g = grade(s, { components: s.expected.components, topology: "single-server" });
    expect(g.topology).toMatchObject({ picked: "single-server", expected: "multi-zone", right: false });
    expect(g.perfect).toBe(false);
  });
});

describe("drills", () => {
  it("gives five answered questions for every part of every reference design", () => {
    for (const s of scenarios) {
      for (const id of s.expected.components) {
        const cards = drills(s, id);
        expect(cards).toHaveLength(5);
        for (const card of cards) {
          expect(card.answer.length, `${s.id}: ${id}: ${card.question}`).toBeGreaterThan(0);
          for (const line of card.answer) expect(line).toBeTruthy();
        }
      }
    }
  });
});
