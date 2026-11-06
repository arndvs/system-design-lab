export type GlossaryEntry = { term: string; definition: string };

export const glossary: Record<string, GlossaryEntry> = {
  "cap-theorem": {
    term: "CAP theorem",
    definition:
      "When a network partition splits a distributed system, each side must either keep answering and risk disagreeing (availability) or refuse requests until it can coordinate (consistency).",
  },
  "change-data-capture": {
    term: "Change data capture",
    definition: "Reading a database's own change log to stream every insert, update and delete to other systems.",
  },
  "columnar-storage": {
    term: "Columnar storage",
    definition: "Storing each column's values together, so queries that touch a few columns over many rows read far less data.",
  },
  consensus: {
    term: "Consensus",
    definition: "A protocol, such as Raft or Paxos, that lets a group of servers agree on one value even if some of them fail.",
  },
  failover: {
    term: "Failover",
    definition: "Switching traffic from a failed primary to a standby that takes over its role.",
  },
  "horizontal-scaling": {
    term: "Horizontal scaling",
    definition: "Adding more machines to share the load, as opposed to vertical scaling, which means buying a bigger machine.",
  },
  "inverted-index": {
    term: "Inverted index",
    definition: "A map from each word to the list of documents that contain it, the core structure behind full-text search.",
  },
  "least-privilege": {
    term: "Least privilege",
    definition: "Giving each user and service only the permissions it needs, so a compromise can do limited damage.",
  },
  "modular-monolith": {
    term: "Modular monolith",
    definition: "One deployable application divided into well-separated modules, so it can be split into services later if needed.",
  },
  mtls: {
    term: "Mutual TLS (mTLS)",
    definition: "TLS where both sides present certificates, so each service proves its identity to the other.",
  },
  nines: {
    term: "Nines of availability",
    definition:
      "Shorthand for uptime targets: 99.9% (three nines) allows about 8.8 hours of downtime a year, 99.99% about 53 minutes, 99.999% about 5 minutes.",
  },
  oauth: {
    term: "OAuth 2.0 / OpenID Connect",
    definition: "Standard protocols for granting access with tokens (OAuth) and for signing users in on top of it (OpenID Connect).",
  },
  "oltp-olap": {
    term: "OLTP vs. OLAP",
    definition:
      "Online transaction processing serves many small reads and writes for live users; online analytical processing runs few, large queries over lots of history.",
  },
  outbox: {
    term: "Outbox",
    definition:
      "Writing an event into the same database transaction as the data change, then publishing it from there, so a change and its event cannot disagree.",
  },
  pacelc: {
    term: "PACELC",
    definition:
      "An extension of CAP: if there's a Partition, choose Availability or Consistency; Else, even when healthy, choose lower Latency or Consistency.",
  },
  "read-your-writes": {
    term: "Read-your-writes",
    definition: "A guarantee that after you change something, your own next read shows the change, even if others may briefly not see it.",
  },
  "replication-lag": {
    term: "Replication lag",
    definition: "How far behind the primary a replica is, in time or in unapplied changes.",
  },
  "signed-url": {
    term: "Signed URL",
    definition: "A link that grants temporary access to one private file, so clients can upload or download it directly.",
  },
  "token-bucket": {
    term: "Token bucket",
    definition:
      "A rate-limiting algorithm: a bucket refills with tokens at a steady rate, each request spends one, and an empty bucket means wait.",
  },
  windowing: {
    term: "Windowing",
    definition: "Grouping a stream of events into time slices, such as each minute, so you can count or aggregate them.",
  },
  acid: {
    term: "ACID",
    definition:
      "Atomicity, consistency, isolation, durability: the guarantees that make a database transaction behave as one reliable unit.",
  },
  "at-least-once": {
    term: "At-least-once delivery",
    definition: "Every message is delivered, but some may arrive more than once, so consumers must tolerate duplicates.",
  },
  "back-pressure": {
    term: "Back-pressure",
    definition: "A way for a slow consumer to signal producers to slow down instead of being overwhelmed.",
  },
  "cache-aside": {
    term: "Cache-aside",
    definition: "The app reads the cache first and, on a miss, loads from the database and fills the cache itself.",
  },
  "cache-hit-ratio": {
    term: "Cache hit ratio",
    definition: "The share of requests answered from the cache. Higher means less load on whatever sits behind it.",
  },
  "correlation-id": {
    term: "Correlation ID",
    definition: "A unique ID attached to a request and passed along to every service it touches, so its logs can be joined up.",
  },
  "dead-letter-queue": {
    term: "Dead-letter queue",
    definition: "A side queue for messages that keep failing, so they can be inspected without blocking the main flow.",
  },
  "eventual-consistency": {
    term: "Eventual consistency",
    definition: "Replicas may briefly disagree after a write, but they converge if no new writes arrive.",
  },
  "golden-signals": {
    term: "Golden signals",
    definition: "Latency, traffic, errors and saturation: the four measurements the Google SRE book suggests watching first.",
  },
  "health-check": {
    term: "Health check",
    definition: "A periodic probe that tells a load balancer or orchestrator whether an instance should receive traffic.",
  },
  idempotent: {
    term: "Idempotent",
    definition: "An operation that has the same effect whether it runs once or several times.",
  },
  "isolation-level": {
    term: "Isolation level",
    definition: "How much one transaction can see of others running at the same time, from read committed up to serializable.",
  },
  origin: {
    term: "Origin",
    definition: "Your own server or storage bucket that a CDN fetches from when it doesn't have a cached copy.",
  },
  "partition-key": {
    term: "Partition key",
    definition: "The field whose value decides which partition, and so which servers, store a record.",
  },
  "percentile-latency": {
    term: "Percentile latency (p99)",
    definition: "The response time that 99% of requests beat. It exposes slow outliers that an average hides.",
  },
  quorum: {
    term: "Quorum",
    definition:
      "The minimum number of replicas that must answer a read or write. Choosing read and write quorums that overlap gives strong consistency.",
  },
  "read-replica": {
    term: "Read replica",
    definition: "A copy of the database that follows the primary and serves read queries, usually slightly behind.",
  },
  sharding: {
    term: "Sharding",
    definition: "Splitting one data set across several databases by a key, so each holds and serves only part of it.",
  },
  saga: {
    term: "Saga",
    definition:
      "A sequence of local transactions across services, where each step has a compensating action that undoes it if a later step fails.",
  },
  "single-point-of-failure": {
    term: "Single point of failure",
    definition: "A part of the system whose failure alone takes the whole service down.",
  },
  slo: {
    term: "SLO",
    definition: "Service level objective: a target such as 99.9% of requests succeeding within 300 ms over 30 days.",
  },
  stateless: {
    term: "Stateless service",
    definition: "A server that keeps no per-user data between requests, so any copy can handle any request.",
  },
  "structured-logging": {
    term: "Structured logging",
    definition: "Writing log events as fields, usually JSON, instead of free text, so they can be filtered and aggregated.",
  },
  "thundering-herd": {
    term: "Thundering herd",
    definition: "Many clients retrying or missing the cache at the same moment and swamping a backend together.",
  },
  ttl: {
    term: "TTL",
    definition: "Time to live: how long a cached copy may be served before it must be refreshed.",
  },
};
