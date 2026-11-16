import { describe, expect, it } from "vitest";
import { components } from "../src/content/components";
import { failures } from "../src/content/failures";
import { failureIn } from "../src/engine/failure";

describe("failure content", () => {
  it("covers every component, and only components", () => {
    expect(Object.keys(failures).sort()).toEqual(Object.keys(components).sort());
  });

  it("says what breaks and how teams contain it, in full sentences", () => {
    for (const [id, f] of Object.entries(failures)) {
      for (const text of [f.breaks, f.contain, ...f.helpedBy.map((h) => h.how)]) {
        expect(text.length, id).toBeGreaterThan(10);
        expect(text, id).toMatch(/[.!?]$/);
      }
    }
  });

  it("only names existing components as help, never the component itself", () => {
    for (const [id, f] of Object.entries(failures)) {
      for (const h of f.helpedBy) {
        expect(components[h.id], `${id} → ${h.id}`).toBeDefined();
        expect(h.id).not.toBe(id);
      }
    }
  });
});

describe("failureIn", () => {
  it("reads the same failure differently with and without the parts that help", () => {
    const bare = failureIn("cache", ["app-servers", "relational-database", "cache"]);
    expect(bare.helping).toEqual([]);
    expect(bare.missing.map((h) => h.id)).toEqual(["database-replicas", "rate-limiter"]);

    const covered = failureIn("cache", ["app-servers", "relational-database", "cache", "database-replicas"]);
    expect(covered.helping.map((h) => h.id)).toEqual(["database-replicas"]);
    expect(covered.missing.map((h) => h.id)).toEqual(["rate-limiter"]);
  });

  it("throws for an unknown component", () => {
    expect(() => failureIn("not-a-component", [])).toThrow();
  });
});
