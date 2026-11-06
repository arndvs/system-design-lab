import { describe, expect, it } from "vitest";
import { downtimeLabel } from "../src/content/availability";
import { BASELINE } from "../src/content/rules";
import { scenarios } from "../src/content/scenarios";
import type { Requirements } from "../src/content/types";
import { evolve } from "../src/engine/evolve";
import { shape } from "../src/content/shape";
import { defaultRequirements, diff, recommend } from "../src/engine/recommend";

const req = (over: Partial<Requirements> = {}): Requirements => ({ ...defaultRequirements, ...over });
const ids = (r: Requirements) => Object.keys(recommend(r).components).sort();
const reasonsFor = (r: Requirements, id: string) => recommend(r).components[id] ?? [];

describe("baseline", () => {
  it("always includes app servers, metrics and logging", () => {
    for (const { id } of BASELINE) expect(ids(req())).toContain(id);
  });
});

describe("data shape decides the primary store", () => {
  const cases = [
    ["relational", "relational-database"],
    ["key-value", "key-value-store"],
    ["document", "document-database"],
    ["graph", "graph-database"],
  ] as const;
  for (const [shape, store] of cases) {
    it(`${shape} → ${store}`, () => expect(ids(req({ dataShape: shape }))).toContain(store));
  }

  it("does not switch stores because of consistency (no SQL-vs-NoSQL myth)", () => {
    const kvStrong = ids(req({ dataShape: "key-value", consistency: "strong" }));
    expect(kvStrong).toContain("key-value-store");
    expect(kvStrong).not.toContain("relational-database");
    expect(reasonsFor(req({ dataShape: "key-value", consistency: "strong" }), "key-value-store").map((r) => r.text).join(" ")).toContain(
      "strongly consistent reads",
    );
  });
});

describe("functional requirements decide which components exist", () => {
  const cases: [Partial<Requirements>, string[]][] = [
    [{ userAccounts: true }, ["auth-service", "rate-limiter"]],
    [{ mediaUploads: true }, ["object-storage", "cdn"]],
    [{ fullTextSearch: true }, ["search-index"]],
    [{ asyncWork: true }, ["message-queue"]],
    [{ realtimeAnalytics: true }, ["message-queue", "stream-processing"]],
    [{ reporting: true }, ["etl-pipeline", "data-warehouse"]],
    [{ opsMaturity: "solid", independentTeams: 3, serviceCount: 6 }, ["api-gateway", "distributed-tracing"]],
  ];
  for (const [over, expected] of cases) {
    it(`${Object.keys(over)[0]} → ${expected.join(", ")}`, () => {
      const result = recommend(req(over)).components;
      for (const id of expected) {
        expect(result).toHaveProperty(id);
        expect(result[id]!.some((r) => r.driver === "functional")).toBe(true);
      }
    });
  }

  it("adds discovery and a mesh only as the service count grows", () => {
    const micro = { opsMaturity: "solid" as const, independentTeams: 3 };
    expect(ids(req({ ...micro, serviceCount: 6 }))).not.toContain("service-discovery");
    expect(ids(req({ ...micro, serviceCount: 12 }))).toContain("service-discovery");
    expect(ids(req({ ...micro, serviceCount: 12 }))).not.toContain("service-mesh");
    expect(ids(req({ ...micro, serviceCount: 30 }))).toContain("service-mesh");
  });

  it("adds no service-level components unless the shape is microservices", () => {
    for (const id of ["api-gateway", "distributed-tracing", "service-discovery", "service-mesh"]) {
      expect(ids(req())).not.toContain(id);
    }
    expect(ids(req({ independentTeams: 10, serviceCount: 50 }))).not.toContain("service-mesh");
  });
});

describe("non-functional targets decide how it's arranged", () => {
  it("a 99% target needs no load balancer and runs on one server", () => {
    const rec = recommend(req({ availability: 99 }));
    expect(rec.components).not.toHaveProperty("load-balancer");
    expect(rec.topology.level).toBe("single-server");
  });

  it("99.9% adds a load balancer even at low traffic", () => {
    const rec = recommend(req({ availability: 99.9, peakRps: 5 }));
    expect(rec.components).toHaveProperty("load-balancer");
    expect(rec.topology.level).toBe("single-zone");
  });

  it("99.99% adds a standby database and spreads across zones", () => {
    const rec = recommend(req({ availability: 99.99 }));
    expect(rec.components).toHaveProperty("database-replicas");
    expect(rec.topology.level).toBe("multi-zone");
  });

  it("99.999% goes multi-region", () => {
    expect(recommend(req({ availability: 99.999 })).topology.level).toBe("multi-region");
  });

  it("quotes the downtime budget in the reason", () => {
    const text = reasonsFor(req({ availability: 99.9 }), "load-balancer")[0]!.text;
    expect(text).toContain(downtimeLabel(99.9));
  });

  it("adds a cache for read-heavy traffic or a tight latency target, not otherwise", () => {
    expect(ids(req({ readWriteRatio: 50 }))).toContain("cache");
    expect(ids(req({ latencyMs: 30 }))).toContain("cache");
    expect(ids(req({ readWriteRatio: 3, latencyMs: 300 }))).not.toContain("cache");
  });

  it("read-heavy adds replicas, except for key-value stores which replicate on their own", () => {
    expect(ids(req({ readWriteRatio: 50, dataShape: "relational" }))).toContain("database-replicas");
    expect(ids(req({ readWriteRatio: 50, dataShape: "key-value" }))).not.toContain("database-replicas");
  });

  it("puts the traffic figure into the scale-out reason", () => {
    const texts = reasonsFor(req({ peakRps: 12000, availability: 99 }), "load-balancer").map((r) => r.text);
    expect(texts[0]).toContain("12,000 req/s");
  });

  it("lists every reason when several rules add the same component, tagged by side", () => {
    const reasons = reasonsFor(req({ availability: 99.9, peakRps: 5000 }), "load-balancer");
    expect(reasons).toHaveLength(2);
    expect(reasons.every((r) => r.driver === "non-functional")).toBe(true);
  });
});

describe("tensions", () => {
  const tensionIds = (r: Requirements) => recommend(r).tensions.map((t) => t.id);

  it("flags consistency vs. availability for global, exact, highly available systems", () => {
    expect(tensionIds(req({ consistency: "mixed", globalUsers: true, availability: 99.99 }))).toContain(
      "consistency-vs-availability",
    );
    expect(tensionIds(req({ consistency: "eventual", globalUsers: true, availability: 99.99 }))).not.toContain(
      "consistency-vs-availability",
    );
  });

  it("flags caching against strong consistency", () => {
    expect(tensionIds(req({ readWriteRatio: 50, consistency: "strong" }))).toContain("cache-vs-strong-consistency");
    expect(tensionIds(req({ readWriteRatio: 50, consistency: "mixed" }))).not.toContain("cache-vs-strong-consistency");
  });

  it("warns that five nines is expensive", () => {
    expect(tensionIds(req({ availability: 99.999 }))).toContain("five-nines-cost");
  });

  it("questions microservices with very few services", () => {
    const micro = { opsMaturity: "solid" as const, independentTeams: 3 };
    expect(tensionIds(req({ ...micro, serviceCount: 2 }))).toContain("too-few-services");
    expect(tensionIds(req({ ...micro, serviceCount: 8 }))).not.toContain("too-few-services");
  });

  it("finds no tensions in the default design", () => {
    expect(tensionIds(req())).toEqual([]);
  });
});

describe("diff", () => {
  it("reports what a single change adds and removes", () => {
    const before = recommend(req());
    const after = recommend(req({ globalUsers: true }));
    expect(diff(before, after)).toEqual({ added: ["cdn"], removed: [] });
    expect(diff(after, before)).toEqual({ added: [], removed: ["cdn"] });
  });
});

describe("scenarios", () => {
  for (const s of scenarios) {
    describe(s.id, () => {
      const rec = recommend(s.requirements);
      it("produces the reference components", () => {
        expect(Object.keys(rec.components).sort()).toEqual([...s.expected.components].sort());
      });
      it("produces the reference topology", () => expect(rec.topology.level).toBe(s.expected.topology));
      it("raises the reference tensions", () => {
        expect(rec.tensions.map((t) => t.id).sort()).toEqual([...s.expected.tensions].sort());
      });
      it("lists functional and non-functional requirements", () => {
        expect(s.functional.length).toBeGreaterThan(0);
        expect(s.nonFunctional.length).toBeGreaterThan(0);
      });
    });
  }
});

describe("application shape", () => {
  it("defaults to a modular monolith and says why", () => {
    const s = shape(req());
    expect(s.level).toBe("modular-monolith");
    expect(s.reason).toContain("limited");
  });

  it("recommends microservices only with solid ops and enough independent teams", () => {
    expect(shape(req({ opsMaturity: "solid", independentTeams: 3 })).level).toBe("microservices");
  });

  it("keeps a modular monolith with few teams, even with solid ops", () => {
    expect(shape(req({ opsMaturity: "solid", independentTeams: 2 })).level).toBe("modular-monolith");
  });

  it("keeps a modular monolith with limited ops, whatever the team count", () => {
    expect(shape(req({ opsMaturity: "limited", independentTeams: 10, unevenScaling: true })).level).toBe("modular-monolith");
  });

  it("splits for uneven scaling with solid ops, even with one team", () => {
    expect(shape(req({ opsMaturity: "solid", unevenScaling: true })).level).toBe("microservices");
  });

  it("quotes the team count in the reason", () => {
    expect(shape(req({ opsMaturity: "solid", independentTeams: 4 })).reason).toContain("4 independent teams");
  });

  it("includes the shape in the recommendation", () => {
    expect(recommend(req({ opsMaturity: "solid", independentTeams: 3 })).shape.level).toBe("microservices");
  });
});

describe("evolve", () => {
  it("starts from a single server and ends with the full recommendation", () => {
    for (const s of scenarios) {
      const stages = evolve(s.requirements);
      expect(stages[0]?.title).toBe("Single server");
      expect(stages.at(-1)?.components.sort()).toEqual(ids(s.requirements));
    }
  });

  it("never adds the same component in two stages", () => {
    for (const s of scenarios) {
      const added = evolve(s.requirements).flatMap((st) => st.added);
      expect(new Set(added).size).toBe(added.length);
    }
  });
});
