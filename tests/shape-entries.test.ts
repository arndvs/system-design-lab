import { describe, expect, it } from "vitest";
import { shapeEntries } from "../src/content/shape-entries";

describe("shape entries", () => {
  it("covers the three application shapes once each", () => {
    expect(shapeEntries.map((s) => s.id).sort()).toEqual(["microservices", "modular-monolith", "monolith"]);
  });

  for (const entry of shapeEntries) {
    describe(entry.name, () => {
      it("fills in the text fields", () => {
        expect(entry.oneLiner.trim()).not.toBe("");
        expect(entry.interviewAngle.trim()).not.toBe("");
        expect(entry.addWhen.length).toBeGreaterThan(0);
        expect(entry.skipWhen.length).toBeGreaterThan(0);
      });

      it("pairs every cost with a mitigation", () => {
        expect(entry.tradeoffs.length).toBeGreaterThan(0);
        for (const t of entry.tradeoffs) {
          expect(t.cost.trim()).not.toBe("");
          expect(t.mitigation.trim()).not.toBe("");
        }
      });

      it("cites at least one https source", () => {
        expect(entry.sources.length).toBeGreaterThan(0);
        for (const s of entry.sources) expect(s.url).toMatch(/^https:\/\//);
      });
    });
  }
});
