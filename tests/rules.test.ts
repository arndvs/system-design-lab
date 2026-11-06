import { describe, expect, it } from "vitest";
import { BASELINE } from "../src/content/rules";
import { scenarios } from "../src/content/scenarios";
import type { Requirements } from "../src/content/types";
import { defaultRequirements, diff, recommend } from "../src/engine/recommend";
import { evolve } from "../src/engine/evolve";

const req = (over: Partial<Requirements> = {}): Requirements => ({ ...defaultRequirements, ...over });
const ids = (r: Requirements) => Object.keys(recommend(r)).sort();

describe("recommend", () => {
  it("always includes the observability baseline", () => {
    for (const id of BASELINE) expect(recommend(req())).toHaveProperty(id);
  });

  it("adds a load balancer whenever high availability is required, even at low traffic", () => {
    expect(ids(req({ highAvailability: true, peakRps: 5 }))).toContain("load-balancer");
  });

  it("adds a load balancer when peak traffic outgrows one server", () => {
    expect(ids(req({ peakRps: 5000 }))).toContain("load-balancer");
    expect(ids(req({ peakRps: 50 }))).not.toContain("load-balancer");
  });

  it("picks the database from data shape, not from consistency (no SQL-vs-NoSQL myth)", () => {
    const kvStrong = ids(req({ dataShape: "key-value", strongConsistency: true }));
    expect(kvStrong).toContain("key-value-store");
    expect(kvStrong).not.toContain("relational-database");

    const relEventual = ids(req({ dataShape: "relational", strongConsistency: false }));
    expect(relEventual).toContain("relational-database");
    expect(relEventual).not.toContain("key-value-store");
  });

  it("explains strong consistency on a key-value store instead of switching stores", () => {
    const reasons = recommend(req({ dataShape: "key-value", strongConsistency: true }))["key-value-store"];
    expect(reasons?.some((r) => r.includes("strongly consistent reads"))).toBe(true);
  });

  it("adds a cache for read-heavy traffic but not for balanced traffic", () => {
    expect(ids(req({ readWriteRatio: 50 }))).toContain("cache");
    expect(ids(req({ readWriteRatio: 3 }))).not.toContain("cache");
  });

  it("lists every reason when several rules add the same component", () => {
    const reasons = recommend(req({ highAvailability: true, peakRps: 5000 }))["load-balancer"];
    expect(reasons).toHaveLength(2);
  });

  it("puts the traffic figure into the scale-out reason", () => {
    const reasons = recommend(req({ peakRps: 12000 }))["load-balancer"];
    expect(reasons?.[0]).toContain("12,000 req/s");
  });
});

describe("diff", () => {
  it("reports what a single toggle adds and removes", () => {
    const before = recommend(req());
    const after = recommend(req({ globalUsers: true }));
    expect(diff(before, after)).toEqual({ added: ["cdn"], removed: [] });
    expect(diff(after, before)).toEqual({ added: [], removed: ["cdn"] });
  });
});

describe("scenarios", () => {
  for (const s of scenarios) {
    it(`${s.id}: the engine produces the reference answer`, () => {
      expect(ids(s.requirements)).toEqual([...s.expected].sort());
    });
  }
});

describe("evolve", () => {
  it("starts from a single server and ends with the full recommendation", () => {
    const r = scenarios[0]!.requirements;
    const stages = evolve(r);
    expect(stages[0]?.title).toBe("Single server");
    expect(stages.at(-1)?.components.sort()).toEqual(ids(r));
  });

  it("never adds the same component in two stages", () => {
    const stages = evolve(req({ highAvailability: true, peakRps: 5000, lowLatency: true, readWriteRatio: 20 }));
    const added = stages.flatMap((s) => s.added);
    expect(new Set(added).size).toBe(added.length);
  });
});
