import { describe, expect, it } from "vitest";
import { defaultRequirements, recommend } from "../src/engine/recommend";
import { fromHash, toHash } from "../src/state";

describe("URL state round trip", () => {
  it("restores the same requirements from a hash", () => {
    const r = {
      ...defaultRequirements,
      independentTeams: 4,
      unevenScaling: true,
      opsMaturity: "solid" as const,
      userAccounts: true,
      availability: 99.99 as const,
    };
    expect(fromHash(`#${toHash(r)}`)).toEqual(r);
  });

  it("encodes nothing for the defaults", () => {
    expect(toHash(defaultRequirements)).toBe("");
  });
});

describe("legacy links", () => {
  it("maps micro=1 to a solid-ops, three-team design", () => {
    const r = fromHash("#micro=1");
    expect(r.opsMaturity).toBe("solid");
    expect(r.independentTeams).toBe(3);
    expect(recommend(r).shape.level).toBe("microservices");
  });

  it("maps micro=0 to the modular monolith default", () => {
    const r = fromHash("#micro=0");
    expect(recommend(r).shape.level).toBe("modular-monolith");
  });

  it("keeps the legacy service count when microservices was on", () => {
    expect(fromHash("#micro=1&services=12").serviceCount).toBe(12);
  });

  it("ignores legacy keys that no longer exist, without crashing", () => {
    expect(() => fromHash("#micro=maybe&services=-3")).not.toThrow();
    expect(fromHash("#micro=maybe").opsMaturity).toBe(defaultRequirements.opsMaturity);
  });

  it("prefers the new keys when both are present", () => {
    const r = fromHash("#micro=1&ops=limited");
    expect(r.opsMaturity).toBe("limited");
  });
});

describe("invalid input", () => {
  it("falls back to defaults for unknown enum values", () => {
    expect(fromHash("#ops=expert").opsMaturity).toBe(defaultRequirements.opsMaturity);
  });
});
