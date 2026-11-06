import type { Requirements } from "./types";

/** Independent teams at which separate deployments start to pay for their overhead. Rule of thumb, not yet sourced. */
export const SPLIT_TEAM_COUNT = 3;

export type Shape = { level: "modular-monolith" | "microservices"; reason: string };

/**
 * Application shape from team and operations inputs. A classic monolith is
 * taught as content but never recommended, so it is not a possible result.
 */
export function shape(r: Requirements): Shape {
  const teams = `${r.independentTeams} independent team${r.independentTeams === 1 ? "" : "s"}`;
  if (r.opsMaturity !== "solid") {
    return {
      level: "modular-monolith",
      reason: `Ops maturity is ${r.opsMaturity}, so running separately deployed services would cost more than it returns. One deployable with clear module boundaries keeps change cheap and can be split later.`,
    };
  }
  const reasons: string[] = [];
  if (r.independentTeams >= SPLIT_TEAM_COUNT) reasons.push(teams);
  if (r.unevenScaling) reasons.push("uneven scaling needs");
  if (reasons.length > 0) {
    return {
      level: "microservices",
      reason: `Ops maturity is solid and you have ${reasons.join(" and ")}, so separate deployments and scaling pay for their overhead.`,
    };
  }
  return {
    level: "modular-monolith",
    reason: `Ops maturity is solid, but you have ${teams} and no uneven scaling needs. Separate services would add cost before they add benefit; one deployable with clear module boundaries is enough.`,
  };
}
