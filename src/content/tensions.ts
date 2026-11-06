import { downtimeLabel } from "./availability";
import { needsCache, TIGHT_LATENCY_MS } from "./rules";
import { shape, SPLIT_TEAM_COUNT } from "./shape";
import type { Tension } from "./types";

/** Combinations of requirements that pull against each other. */
export const tensions: Tension[] = [
  {
    id: "consistency-vs-availability",
    when: (r) => r.consistency !== "eventual" && r.globalUsers && r.availability >= 99.99,
    title: "Consistency vs. availability across regions",
    explain:
      "You want exact data, worldwide users and very high uptime. If the network between regions fails, a region holding strongly consistent data must either stop accepting writes (losing availability) or keep going and risk two regions disagreeing (losing consistency). You can't have both during the split.",
    options: [
      "Narrow strong consistency to the few records that truly need it, and let the rest be eventually consistent.",
      "Give each strongly consistent record a home region; other regions forward writes there and accept the extra latency.",
      "Use a database built for global consistency, such as Spanner or CockroachDB, and budget for slower writes.",
    ],
    concepts: ["cap-theorem", "pacelc"],
  },
  {
    id: "latency-vs-consistency",
    when: (r) => r.consistency !== "eventual" && r.globalUsers && r.latencyMs < 150,
    title: "Latency vs. consistency for distant users",
    explain: (r) =>
      `A network round trip between continents commonly takes 70 to over 150 ms, so a ${r.latencyMs} ms target can't include a check with a faraway primary. Even with no failures, consistency across regions costs latency.`,
    options: [
      "Serve reads from a nearby replica or cache, and accept that non-critical data may be slightly stale.",
      "Keep strongly consistent operations, such as checkout, on a slower path with its own latency target.",
    ],
    concepts: ["pacelc", "read-your-writes"],
  },
  {
    id: "five-nines-cost",
    when: (r) => r.availability >= 99.999,
    title: "Is five nines worth it?",
    explain: (r) =>
      `${r.availability}% allows about ${downtimeLabel(r.availability)} of downtime a year. Each extra nine usually means another layer of redundancy, automated failover, and people on call, so cost rises steeply while the user benefit shrinks.`,
    options: [
      "Confirm which features truly need this target; checkout may, browsing may not.",
      "Set separate targets per feature instead of one target for the whole system.",
    ],
    concepts: ["nines"],
  },
  {
    id: "cache-vs-strong-consistency",
    when: (r) => needsCache(r) && r.consistency === "strong",
    title: "Caching vs. always-fresh reads",
    explain:
      "A cache is recommended for speed, but you also need every read to be current. A cached copy is by definition a little behind the database.",
    options: [
      "Delete or update the cached entry in the same code path that writes the record.",
      "Skip the cache for the reads that must be exact, and cache only the rest.",
      "Reconsider whether all data needs strong consistency; choosing mixed is often closer to the truth.",
    ],
    concepts: ["cache-aside", "ttl"],
  },
  {
    id: "rate-limit-vs-latency",
    when: (r) => r.userAccounts && r.latencyMs <= TIGHT_LATENCY_MS,
    title: "Abuse protection vs. a tight latency budget",
    explain: (r) =>
      `Rate limiting adds a counter check to each request it covers, which eats into a ${r.latencyMs} ms budget if the counter lives far away.`,
    options: [
      "Keep counters in an in-memory store in the same zone as the servers.",
      "Apply strict limits only to sensitive endpoints such as sign-in, and coarse limits at the edge for the rest.",
    ],
    concepts: ["token-bucket"],
  },
  {
    id: "marginal-microservices",
    when: (r) => shape(r).level === "microservices" && r.independentTeams === SPLIT_TEAM_COUNT && !r.unevenScaling,
    title: "A marginal case for microservices",
    explain: `The split rests only on the team threshold, and it is a rule of thumb. Exactly ${SPLIT_TEAM_COUNT} independent teams with no uneven scaling meets the line, but separate deployments add ongoing cost that a slightly larger team would justify more clearly.`,
    options: [
      "Keep one deployable with strict module boundaries, and revisit when a team or a scaling need grows.",
      "Split only the one module whose team or traffic clearly justifies its own deployment.",
    ],
    concepts: ["modular-monolith"],
  },
  {
    id: "split-data-consistency",
    when: (r) => shape(r).level === "microservices" && r.consistency !== "eventual",
    title: "Splitting data across services vs. exact answers",
    explain:
      "Each service owns its data, so an operation that must be exact across services can no longer rely on one database transaction. Without a coordinated approach, a failure partway through leaves the services disagreeing.",
    options: [
      "Keep the exact operation inside one service that owns all the data it needs.",
      "Coordinate the steps with a saga, where each step has a compensating action.",
      "Write the change and its event in one transaction, then publish the event from an outbox.",
    ],
    concepts: ["saga", "outbox"],
  },
];
