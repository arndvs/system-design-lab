export type GlossaryEntry = { term: string; definition: string };

export const glossary: Record<string, GlossaryEntry> = {
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
