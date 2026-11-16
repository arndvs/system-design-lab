/**
 * What happens when each component fails, and what limits the damage.
 *
 * `helpedBy` names other components that soften the failure. The engine checks
 * which of them a design actually has, so the same failure reads differently
 * with and without them.
 */
export type Failure = {
  /** What users and the rest of the system notice. */
  breaks: string;
  /** What teams usually do so the failure hurts less. */
  contain: string;
  /** Other components that limit the damage when present in the design. */
  helpedBy: { id: string; how: string }[];
};

export const failures: Record<string, Failure> = {
  "load-balancer": {
    breaks:
      "Every request to the servers behind it fails, even though those servers are healthy. Unless it is redundant itself, it is a single point of failure.",
    contain:
      "Use a managed load balancer or a pair with failover, spread across zones, and point DNS at more than one entry address.",
    helpedBy: [{ id: "cdn", how: "Files and pages already cached at the edge keep loading." }],
  },
  "app-servers": {
    breaks:
      "Requests sent to a dead server fail until something stops routing to it. With only one server, the whole service is down.",
    contain:
      "Run at least two servers, keep session state out of them so any server can take any request, and let health checks remove a failed one.",
    helpedBy: [
      { id: "load-balancer", how: "Its health checks stop sending traffic to the failed server." },
      { id: "cdn", how: "Files and pages already cached at the edge keep loading." },
    ],
  },
  "auth-service": {
    breaks:
      "Nobody can sign in, and every request that checks a session against the service fails, so most of the product locks up for signed-in users.",
    contain:
      "Issue signed tokens that other services can verify on their own until they expire, cache the signing keys, and run the service redundantly.",
    helpedBy: [],
  },
  cache: {
    breaks:
      "Every read goes to the database. A database sized for cache misses can be overwhelmed, so it slows down or fails for everyone.",
    contain:
      "Run the cache replicated, limit how fast the application retries, and load test the database with the cache empty.",
    helpedBy: [
      { id: "database-replicas", how: "They share the extra read load while the cache refills." },
      { id: "rate-limiter", how: "It caps how much traffic reaches the database at once." },
    ],
  },
  cdn: {
    breaks:
      "Every request for files and cached pages goes to your own servers, which see a sudden jump in traffic. Users far from your region load more slowly.",
    contain:
      "Size the origin to survive a cold CDN for a short time, or keep a second CDN ready to switch DNS to.",
    helpedBy: [
      { id: "load-balancer", how: "It spreads the extra origin traffic over several servers." },
      { id: "object-storage", how: "Files come straight from object storage, so the extra file traffic skips your application servers." },
    ],
  },
  "centralized-logging": {
    breaks:
      "The product keeps working, but you lose the record of what happened, so anything that goes wrong during the outage is hard to debug or audit.",
    contain:
      "Buffer logs on each server and ship them once the service is back, and alert when log volume drops to zero.",
    helpedBy: [
      { id: "metrics-monitoring", how: "Metrics still show that something is wrong." },
      { id: "distributed-tracing", how: "Traces still show where slow or failed requests went." },
    ],
  },
  "data-warehouse": {
    breaks: "Reports and dashboards stop or show old numbers. The product itself keeps working.",
    contain:
      "Keep the raw data outside the warehouse so its tables can be reloaded, and show when each report was last refreshed.",
    helpedBy: [
      { id: "etl-pipeline", how: "Its runs can be replayed to load what was missed." },
      { id: "object-storage", how: "Raw exports kept there let you rebuild the tables." },
    ],
  },
  "database-replicas": {
    breaks:
      "Reads sent to the failed replica fail or move to the others. If the primary has to take them all, it can slow down. Writes are not affected.",
    contain:
      "Run more than one replica, health-check them, and stop sending reads to one that dies or falls too far behind.",
    helpedBy: [{ id: "cache", how: "It answers most repeat reads without touching a replica." }],
  },
  "distributed-tracing": {
    breaks:
      "Requests keep working, but you lose the view of where time goes across services, so slow paths are harder to find.",
    contain: "Sample traces and drop them under pressure. Tracing should never slow down or block a request.",
    helpedBy: [
      { id: "centralized-logging", how: "Logs still record each service's errors." },
      { id: "metrics-monitoring", how: "Metrics still show which service is slow." },
    ],
  },
  "document-database": {
    breaks:
      "Reads and writes of the data it holds fail. Without replicas, that data is unavailable until the server is restored.",
    contain: "Run a replica set across zones with automatic failover, and test restoring from backup.",
    helpedBy: [{ id: "cache", how: "Recently read documents can still be served, though they may be stale." }],
  },
  "etl-pipeline": {
    breaks: "New data stops reaching the warehouse, so reports go stale. The product keeps working.",
    contain: "Make each run safe to repeat, so a failed run can simply run again, and alert when a run is late.",
    helpedBy: [],
  },
  "graph-database": {
    breaks:
      "Queries that follow relationships fail, and the features built on them, such as recommendations or connection lists, stop.",
    contain:
      "Run a replicated cluster with failover, and design those features to fall back to something simpler, such as a plain list.",
    helpedBy: [{ id: "cache", how: "Recent query results can still be served, though they may be stale." }],
  },
  "key-value-store": {
    breaks:
      "Keys stored on the failed node cannot be read or written until a replica takes over. Keys on other nodes keep working.",
    contain: "Replicate each key to several nodes across zones, and choose how many must answer each read and write.",
    helpedBy: [{ id: "cache", how: "Hot keys can still be answered from the cache." }],
  },
  "message-queue": {
    breaks:
      "New background work cannot be queued, and work already queued waits. Requests that only hand off work either fail or have to hold it.",
    contain:
      "Run the queue replicated and durable, and have producers retry with backoff or record the work in the database first and send it later.",
    helpedBy: [],
  },
  "metrics-monitoring": {
    breaks: "Nothing pages anyone, so a second failure can go unnoticed. The product keeps working.",
    contain:
      "Watch the monitoring from outside, for example with an external uptime check, and run it apart from the systems it watches.",
    helpedBy: [{ id: "centralized-logging", how: "Errors are still recorded for later." }],
  },
  "object-storage": {
    breaks: "Uploads fail, and files that are not cached elsewhere cannot be loaded. The rest of the product can keep working.",
    contain: "Use a managed store across zones, and for files you cannot lose access to, replicate them to a second region.",
    helpedBy: [{ id: "cdn", how: "Files already cached at the edge keep loading." }],
  },
  "rate-limiter": {
    breaks:
      "You have to choose. Fail closed and requests are rejected; fail open and traffic passes with no limit, exposing everything behind it to abuse.",
    contain:
      "Decide per route: fail open for ordinary reads, fail closed for sign-in and other routes attackers target, and keep a simple limit on each server as a fallback.",
    helpedBy: [],
  },
  "relational-database": {
    breaks: "Writes fail, and so do reads that need the primary. For most products this is a full outage.",
    contain: "Keep a standby in another zone with automatic failover, and test restoring from backup on a schedule.",
    helpedBy: [
      { id: "database-replicas", how: "One can be promoted to primary, and reads can continue from them meanwhile." },
      { id: "cache", how: "Repeat reads are still answered, though they may be stale." },
    ],
  },
  "search-index": {
    breaks: "Search stops or returns partial results. Pages that do not search keep working.",
    contain:
      "Replicate the index, and keep the database as the record of truth so the index can always be rebuilt from it.",
    helpedBy: [],
  },
  "service-discovery": {
    breaks:
      "Services cannot look up new addresses. Calls to addresses they already know keep working until those addresses change.",
    contain: "Run it as a replicated cluster, and let callers keep using the last addresses they looked up.",
    helpedBy: [],
  },
  "service-mesh": {
    breaks:
      "If the control plane fails, traffic keeps flowing with the last configuration it pushed. If a proxy beside a service fails, that service cannot send or receive requests.",
    contain: "Run the control plane redundantly, and roll proxy upgrades out to a few services at a time.",
    helpedBy: [],
  },
  "stream-processing": {
    breaks: "Live counts and alerts stop or fall behind. Events wait in the stream and are processed late.",
    contain:
      "Save progress regularly so processing resumes where it stopped, and keep events in the stream long enough to cover an outage.",
    helpedBy: [],
  },
  "api-gateway": {
    breaks: "Every client request fails, because the gateway is the single front door.",
    contain: "Run it redundantly across zones, keep it thin, and keep business logic out of it.",
    helpedBy: [{ id: "cdn", how: "Files and pages already cached at the edge keep loading." }],
  },
  "vector-store": {
    breaks:
      "Questions can no longer find the passages they need. The model either refuses or answers without your documents, which is when it is most likely to invent details.",
    contain:
      "Refuse rather than answer ungrounded, run the store replicated, and keep the source documents so the index can be rebuilt.",
    helpedBy: [{ id: "search-index", how: "Keyword search can still find passages while vector search is down." }],
  },
  "model-gateway": {
    breaks: "Every feature that calls a model fails at once, even though the providers behind it are healthy.",
    contain: "Run several stateless copies behind a load balancer, and keep the gateway's own logic small.",
    helpedBy: [{ id: "load-balancer", how: "It stops sending calls to a gateway copy that has failed." }],
  },
  "model-serving": {
    breaks:
      "Requests to your own model fail or queue. New GPU servers can take minutes to start, so capacity does not come back quickly.",
    contain: "Keep spare capacity warm, and route to a provider's model as a fallback while your servers recover.",
    helpedBy: [{ id: "model-gateway", how: "It can fall back to a provider's model while your servers are down." }],
  },
  "llm-evals": {
    breaks: "The product keeps working, but prompt and model changes ship without a quality check.",
    contain: "Block releases that change prompts or models until the suite runs again.",
    helpedBy: [],
  },
};
