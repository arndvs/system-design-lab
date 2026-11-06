import { downtimeLabel } from "./availability";
import { FEW_SERVICES, needsCache, TIGHT_LATENCY_MS } from "./rules";
import { shape } from "./shape";
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
    id: "too-few-services",
    when: (r) => shape(r).level === "microservices" && r.serviceCount < FEW_SERVICES,
    title: "Microservices with very few services",
    explain: (r) =>
      `With ${r.serviceCount} service${r.serviceCount === 1 ? "" : "s"}, you take on network calls, partial failures and harder debugging, without the benefit of many teams deploying independently.`,
    options: [
      "Start with a modular monolith: one deployable with clear internal boundaries.",
      "Split out a service only when a team or a scaling need clearly calls for it.",
    ],
    concepts: ["modular-monolith"],
  },
];
