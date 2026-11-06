import { downtimeLabel } from "./availability";
import type { Requirements, Rule, Topology } from "./types";

// Thresholds are named so the reasons can quote them and tests can pin them.
/** Above this, plan for more than one application server. */
export const MULTI_SERVER_RPS = 1000;
/** At or above this many reads per write, a cache usually pays for itself. */
export const READ_HEAVY_RATIO = 10;
/** At or below this many reads per write, traffic is write-heavy. */
export const WRITE_HEAVY_RATIO = 2;
/** At or below this p99 target, database round trips need a cache in front. */
export const TIGHT_LATENCY_MS = 50;
/** Service counts at which shared discovery and then a mesh start to pay off. */
export const DISCOVERY_SERVICE_COUNT = 10;
export const MESH_SERVICE_COUNT = 25;
/** Below this many services, microservices usually cost more than they return. */
export const FEW_SERVICES = 5;
/** Independent teams at which separate deployments start to pay for their overhead. Rule of thumb, not yet sourced. */
export const SPLIT_TEAM_COUNT = 3;

const primaryStore = (r: Requirements): string =>
  ({
    relational: "relational-database",
    "key-value": "key-value-store",
    document: "document-database",
    graph: "graph-database",
  })[r.dataShape];

export const needsCache = (r: Requirements) => r.readWriteRatio >= READ_HEAVY_RATIO || r.latencyMs <= TIGHT_LATENCY_MS;

/** Included in every design, whatever the requirements. */
export const BASELINE: { id: string; reason: string }[] = [
  { id: "app-servers", reason: "Every design needs somewhere for its logic to run." },
  {
    id: "metrics-monitoring",
    reason: "Baseline for any production system: without metrics you can't detect problems or size anything else.",
  },
  {
    id: "centralized-logging",
    reason: "Baseline for any production system: without searchable logs you can't debug or audit what happened.",
  },
];

export const rules: Rule[] = [
  // ---- Functional: what the system does ----------------------------------
  {
    id: "shape-relational",
    driver: "functional",
    when: (r) => r.dataShape === "relational",
    add: ["relational-database"],
    reason: "Your records reference each other and you'll query across them, which is what relational databases do best.",
    stage: 0,
    bottleneck: "Every design starts with somewhere to keep the data.",
  },
  {
    id: "shape-key-value",
    driver: "functional",
    when: (r) => r.dataShape === "key-value",
    add: ["key-value-store"],
    reason: "Almost every access is by one key, which spreads cleanly across machines.",
    stage: 0,
    bottleneck: "Every design starts with somewhere to keep the data.",
  },
  {
    id: "shape-document",
    driver: "functional",
    when: (r) => r.dataShape === "document",
    add: ["document-database"],
    reason: "Your records are nested and read whole, so storing each as one document matches how you use it.",
    stage: 0,
    bottleneck: "Every design starts with somewhere to keep the data.",
  },
  {
    id: "shape-graph",
    driver: "functional",
    when: (r) => r.dataShape === "graph",
    add: ["graph-database"],
    reason: "Your key questions follow chains of connections, which a graph walks directly instead of joining repeatedly.",
    stage: 0,
    bottleneck: "Every design starts with somewhere to keep the data.",
  },
  {
    id: "user-accounts",
    driver: "functional",
    when: (r) => r.userAccounts,
    add: ["auth-service", "rate-limiter"],
    reason:
      "Users sign in, so you need to verify who they are and what they may do, and to throttle sign-in attempts against password guessing.",
    stage: 1,
    bottleneck: "Anyone can act as anyone, and bots can try passwords without limit.",
  },
  {
    id: "media-uploads",
    driver: "functional",
    when: (r) => r.mediaUploads,
    add: ["object-storage", "cdn"],
    reason:
      "Users upload and view images or video. Files go to object storage, uploaded directly with signed URLs, and reach viewers through a CDN.",
    stage: 2,
    bottleneck: "Large files clog the database and the app servers' bandwidth.",
  },
  {
    id: "full-text-search",
    driver: "functional",
    when: (r) => r.fullTextSearch,
    add: ["search-index"],
    reason: "Users search by free text. An inverted index answers ranked text queries that a database can't do well.",
    stage: 3,
    bottleneck: "Text searches scan whole tables and still return poorly ranked results.",
  },
  {
    id: "async-work",
    driver: "functional",
    when: (r) => r.asyncWork,
    add: ["message-queue"],
    reason: "Some work can finish after the response. A queue hands it to workers so requests return quickly and nothing is lost.",
    stage: 4,
    bottleneck: "Requests wait on slow follow-up work the user doesn't need to see finish.",
  },
  {
    id: "realtime-analytics",
    driver: "functional",
    when: (r) => r.realtimeAnalytics,
    add: ["message-queue", "stream-processing"],
    reason: "Results must update within seconds of events. Events flow through a durable log into a stream processor that keeps live aggregates.",
    stage: 5,
    bottleneck: "Live numbers computed by querying the database on every view overload it.",
  },
  {
    id: "reporting",
    driver: "functional",
    when: (r) => r.reporting,
    add: ["etl-pipeline", "data-warehouse"],
    reason: "The business needs reports across history. A pipeline copies data into a warehouse so big queries never touch live traffic.",
    stage: 5,
    bottleneck: "Large report queries slow down the database serving users.",
  },
  {
    id: "microservices",
    driver: "functional",
    when: (r) => r.microservices,
    add: ["api-gateway", "distributed-tracing"],
    reason:
      "You're splitting into services. A gateway gives clients one front door and handles shared concerns; tracing shows where time goes as a request crosses services.",
    stage: 6,
    bottleneck: "Teams block each other in one codebase, and cross-service requests are a black box.",
  },
  {
    id: "many-services",
    driver: "functional",
    when: (r) => r.microservices && r.serviceCount >= DISCOVERY_SERVICE_COUNT,
    add: ["service-discovery"],
    reason: (r) =>
      `With ${r.serviceCount} services scaling independently, addresses change constantly; services look each other up by name instead.`,
    stage: 7,
    bottleneck: "Hard-coded service addresses break every time something scales or moves.",
  },
  {
    id: "very-many-services",
    driver: "functional",
    when: (r) => r.microservices && r.serviceCount >= MESH_SERVICE_COUNT,
    add: ["service-mesh"],
    reason: (r) =>
      `At ${r.serviceCount} services, re-implementing retries, timeouts and encryption in each one costs more than running a mesh that does it for all of them.`,
    stage: 7,
    bottleneck: "Every team re-implements retries, timeouts and TLS slightly differently.",
  },

  // ---- Non-functional: how well it must do it ----------------------------
  {
    id: "consistency-strong",
    driver: "non-functional",
    when: (r) => r.consistency === "strong",
    add: (r) => [primaryStore(r)],
    reason: (r) =>
      r.dataShape === "key-value"
        ? "Every read must see the latest write. You don't need to switch to SQL for that: request strongly consistent reads from the store, at some cost in latency."
        : r.dataShape === "document"
          ? "Every read must see the latest write. Use majority read and write concerns so reads never return data a failover could roll back."
          : "Every read must see the latest write, so serve reads from the primary or synchronous replicas, never from lagging copies.",
    stage: 0,
    bottleneck: "Readers must never see stale values after a write.",
  },
  {
    id: "consistency-mixed",
    driver: "non-functional",
    when: (r) => r.consistency === "mixed",
    add: (r) => [primaryStore(r)],
    reason:
      "Only some data must never be stale, like balances or stock counts. Read that data from the primary with strong guarantees, and let everything else come from caches or replicas.",
    stage: 0,
    bottleneck: "A few values must always be exact, while the rest can lag a little.",
  },
  {
    id: "availability-redundancy",
    driver: "non-functional",
    when: (r) => r.availability >= 99.9,
    add: ["load-balancer"],
    reason: (r) =>
      `A ${r.availability}% target allows only about ${downtimeLabel(r.availability)} of downtime a year, so run at least two servers behind a load balancer that skips a failed one.`,
    stage: 1,
    bottleneck: "One server is one failure away from a full outage.",
  },
  {
    id: "availability-standby",
    driver: "non-functional",
    when: (r) => r.availability >= 99.99 && r.dataShape !== "key-value",
    add: ["database-replicas"],
    reason: (r) =>
      `At ${r.availability}% (about ${downtimeLabel(r.availability)} a year) you can't wait to rebuild a failed database. Keep a standby in another zone, ready to be promoted.`,
    stage: 1,
    bottleneck: "A database failure takes hours to recover from backups.",
  },
  {
    id: "scale-out",
    driver: "non-functional",
    when: (r) => r.peakRps > MULTI_SERVER_RPS,
    add: ["load-balancer"],
    reason: (r) =>
      `Peak traffic of ${r.peakRps.toLocaleString("en-US")} req/s is more than one application server should carry, so you'll spread it over several.`,
    stage: 1,
    bottleneck: "The application server's CPU is saturated at peak.",
  },
  {
    id: "read-heavy-cache",
    driver: "non-functional",
    when: (r) => r.readWriteRatio >= READ_HEAVY_RATIO,
    add: ["cache"],
    reason: (r) => `Traffic is read-heavy (${r.readWriteRatio}:1), so most reads repeat recent ones and can be answered from memory.`,
    stage: 2,
    bottleneck: "The database spends most of its time answering the same reads.",
  },
  {
    id: "read-heavy-replicas",
    driver: "non-functional",
    when: (r) => r.readWriteRatio >= READ_HEAVY_RATIO && r.dataShape !== "key-value",
    add: ["database-replicas"],
    reason: (r) => `At ${r.readWriteRatio} reads per write, read replicas take the query load that the cache misses off the primary.`,
    stage: 2,
    bottleneck: "Cache misses alone still keep the primary busy.",
  },
  {
    id: "tight-latency",
    driver: "non-functional",
    when: (r) => r.latencyMs <= TIGHT_LATENCY_MS,
    add: ["cache"],
    reason: (r) =>
      `A ${r.latencyMs} ms p99 target leaves little room for database queries. A cache hit returns in well under a millisecond.`,
    stage: 2,
    bottleneck: "Database round trips use up the latency budget.",
  },
  {
    id: "global-users",
    driver: "non-functional",
    when: (r) => r.globalUsers,
    add: ["cdn"],
    reason: "Your users are worldwide. A CDN answers them from nearby edge servers instead of one distant region.",
    stage: 3,
    bottleneck: "Users far from your region wait on long network round trips.",
  },
  {
    id: "sensitive-data",
    driver: "non-functional",
    when: (r) => r.sensitiveData,
    add: ["auth-service"],
    reason:
      "You handle payments or personal data, so every access must be authenticated, limited to what each role needs, and recorded. Encrypt it in transit and at rest.",
    stage: 1,
    bottleneck: "Sensitive data is reachable without checks or an audit trail.",
  },
  {
    id: "write-spikes",
    driver: "non-functional",
    when: (r) => r.peakRps > MULTI_SERVER_RPS && r.readWriteRatio <= WRITE_HEAVY_RATIO,
    add: ["message-queue"],
    reason: "Heavy write traffic at peak. A queue absorbs the spike so the database can write at a steady pace.",
    stage: 4,
    bottleneck: "Write bursts overload the database.",
  },
];

export const resolveReason = (rule: Rule, r: Requirements): string =>
  typeof rule.reason === "function" ? rule.reason(r) : rule.reason;

export const resolveAdd = (rule: Rule, r: Requirements): string[] =>
  typeof rule.add === "function" ? rule.add(r) : rule.add;

/** Where the system runs, driven mostly by the availability target. */
export function topology(r: Requirements): { level: Topology; reason: string } {
  const budget = `about ${downtimeLabel(r.availability)} of downtime a year`;
  if (r.availability >= 99.999 || (r.globalUsers && r.availability >= 99.99)) {
    return {
      level: "multi-region",
      reason:
        r.availability >= 99.999
          ? `${r.availability}% allows ${budget}, less than a typical failover takes by hand. Run in at least two regions that can each take all traffic, with automatic failover.`
          : `With worldwide users and ${r.availability}% (${budget}), run in several regions: users get a nearby region, and a regional outage doesn't take everyone down.`,
    };
  }
  if (r.availability >= 99.99) {
    return {
      level: "multi-zone",
      reason: `${r.availability}% allows ${budget}. One data center outage could use that up, so spread servers and a database standby across zones.`,
    };
  }
  if (r.availability >= 99.9 || r.peakRps > MULTI_SERVER_RPS) {
    return {
      level: "single-zone",
      reason:
        r.availability >= 99.9
          ? `${r.availability}% allows ${budget}: enough to absorb a rare zone outage, but not a single server's crashes and deploys. Run redundant servers in one zone.`
          : "Traffic needs several servers, but the availability target is loose enough that one zone will do.",
    };
  }
  return {
    level: "single-server",
    reason: `${r.availability}% allows ${budget}, so one server with good backups can meet it. Add redundancy when the target tightens.`,
  };
}
