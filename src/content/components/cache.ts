import type { Component } from "../types";

export const cache: Component = {
  id: "cache",
  name: "Cache",
  layer: "data",
  oneLiner: "Keeps recently used results in memory so repeat reads skip the slower database.",
  howItWorks:
    "The most common setup is cache-aside: the application checks the cache first, and on a miss it reads the database, then writes the result into the cache with an expiry time. Because the data lives in RAM on a nearby server, a hit usually returns in well under a millisecond.",
  addWhen: [
    "Reads far outnumber writes and the same items are requested again and again.",
    "The database is the bottleneck and most of its load is repeat reads.",
    "You have a latency budget the database alone cannot meet.",
  ],
  skipWhen: [
    "Data changes on almost every read, so cached copies would be stale immediately.",
    "The database already meets your latency target with room to spare.",
  ],
  tradeoffs: [
    {
      cost: "The cache and the database can disagree, so users may read stale data.",
      mitigation: "Set a TTL that matches how stale each kind of data may be, and delete the cached key when the record is written.",
    },
    {
      cost: "When a popular key expires, many requests miss together and hit the database at once.",
      mitigation: "Let one request rebuild the value while others wait or get the old copy, and add random jitter to expiry times.",
    },
    {
      cost: "Losing the cache sends full traffic to a database sized for a fraction of it.",
      mitigation: "Run the cache replicated, and load test the database with the cache cold.",
    },
  ],
  interviewAngle:
    "Be ready to compare cache-aside, write-through and write-back, pick an eviction policy, and explain how you would handle a thundering herd.",
  tools: [
    { name: "Redis", kind: "self-hosted" },
    { name: "Valkey", kind: "self-hosted" },
    { name: "Memcached", kind: "self-hosted" },
    { name: "Amazon ElastiCache", kind: "managed" },
  ],
  related: ["relational-database", "key-value-store", "cdn"],
  glossary: ["ttl", "cache-aside", "thundering-herd", "cache-hit-ratio"],
  sources: [
    {
      title: "Microsoft Azure Architecture Center: Cache-Aside pattern",
      url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside",
    },
    { title: "AWS: Caching best practices", url: "https://aws.amazon.com/caching/best-practices/" },
  ],
};
