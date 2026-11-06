import type { Requirements, Rule } from "./types";

/** Above this, plan for more than one application server. */
export const MULTI_SERVER_RPS = 1000;
/** At or above this many reads per write, a cache usually pays for itself. */
export const READ_HEAVY_RATIO = 10;
/** At or below this many reads per write, traffic is write-heavy. */
export const WRITE_HEAVY_RATIO = 2;

export const BASELINE: string[] = ["metrics-monitoring", "centralized-logging"];
export const BASELINE_REASON =
  "Baseline for any production system: without metrics and logs you can't detect, debug or size anything else.";

export const rules: Rule[] = [
  {
    id: "shape-relational",
    when: (r) => r.dataShape === "relational",
    add: ["relational-database"],
    reason: "Your data is relational: records reference each other and you'll query across them.",
    stage: 0,
    bottleneck: "Every design starts with somewhere to keep the data.",
  },
  {
    id: "shape-key-value",
    when: (r) => r.dataShape === "key-value",
    add: ["key-value-store"],
    reason: "Your access pattern is lookup by key, which partitions cleanly across machines.",
    stage: 0,
    bottleneck: "Every design starts with somewhere to keep the data.",
  },
  {
    id: "strong-consistency-key-value",
    when: (r) => r.dataShape === "key-value" && r.strongConsistency,
    add: ["key-value-store"],
    reason:
      "You need strong consistency. That doesn't require switching to SQL: request strongly consistent reads from the store, at some cost in latency.",
    stage: 0,
    bottleneck: "Readers must never see stale values after a write.",
  },
  {
    id: "high-availability",
    when: (r) => r.highAvailability,
    add: ["load-balancer"],
    reason:
      "You need high availability, so you'll run redundant servers. A load balancer routes between them and stops sending traffic to one that fails.",
    stage: 1,
    bottleneck: "One server is one failure away from a full outage.",
  },
  {
    id: "scale-out",
    when: (r) => r.peakRps > MULTI_SERVER_RPS,
    add: ["load-balancer"],
    reason: (r) =>
      `Peak traffic of ${r.peakRps.toLocaleString("en-US")} req/s is more than one application server should carry, so you'll spread it over several.`,
    stage: 1,
    bottleneck: "The application server's CPU is saturated at peak.",
  },
  {
    id: "read-heavy",
    when: (r) => r.readWriteRatio >= READ_HEAVY_RATIO,
    add: ["cache"],
    reason: (r) =>
      `Traffic is read-heavy (${r.readWriteRatio}:1), so most reads repeat recent ones and can be answered from memory.`,
    stage: 2,
    bottleneck: "The database spends most of its time answering the same reads.",
  },
  {
    id: "low-latency",
    when: (r) => r.lowLatency,
    add: ["cache"],
    reason: "You need low latency. A cache hit returns in well under a millisecond, far faster than a database query.",
    stage: 2,
    bottleneck: "Database round trips blow the latency budget.",
  },
  {
    id: "global-users",
    when: (r) => r.globalUsers,
    add: ["cdn"],
    reason: "Your users are worldwide. A CDN answers them from nearby edge servers instead of one distant region.",
    stage: 3,
    bottleneck: "Users far from your region wait on long network round trips.",
  },
  {
    id: "media-uploads",
    when: (r) => r.mediaUploads,
    add: ["cdn"],
    reason: "You serve images or video. Delivering large files from the edge saves bandwidth and time at your origin.",
    stage: 3,
    bottleneck: "Large media downloads eat origin bandwidth.",
  },
  {
    id: "event-driven",
    when: (r) => r.eventDriven,
    add: ["message-queue"],
    reason: "Work happens in response to events. A queue lets producers move on while workers handle each event reliably.",
    stage: 4,
    bottleneck: "Requests wait on slow follow-up work they don't need to see finish.",
  },
  {
    id: "write-spikes",
    when: (r) => r.peakRps > MULTI_SERVER_RPS && r.readWriteRatio <= WRITE_HEAVY_RATIO,
    add: ["message-queue"],
    reason: "Heavy write traffic at peak. A queue absorbs the spike so the database can write at a steady pace.",
    stage: 4,
    bottleneck: "Write bursts overload the database.",
  },
];

export const resolveReason = (rule: Rule, r: Requirements): string =>
  typeof rule.reason === "function" ? rule.reason(r) : rule.reason;
