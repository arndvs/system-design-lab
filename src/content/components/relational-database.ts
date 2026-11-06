import type { Component } from "../types";

export const relationalDatabase: Component = {
  id: "relational-database",
  name: "Relational Database",
  layer: "data",
  oneLiner: "Stores data in tables with enforced relationships and lets you change many rows in one all-or-nothing transaction.",
  howItWorks:
    "You define a schema of tables, columns and constraints, and query it with SQL, joining tables as needed. Transactions group several changes so they all commit or none do, and the isolation level controls what concurrent transactions can see of each other's work.",
  addWhen: [
    "Entities reference each other, such as users, orders and line items, and you query across them.",
    "Correctness rules must hold across rows, like a balance that may never go negative.",
    "You don't yet know every query you'll need, so flexible ad-hoc querying matters.",
  ],
  skipWhen: [
    "Every access is a lookup by one key at very high volume, where a key-value store is simpler to scale.",
    "You are storing large files; keep those in object storage and save only their metadata here.",
  ],
  tradeoffs: [
    {
      cost: "Writes all go to one primary server, which eventually caps write throughput.",
      mitigation: "Scale the primary vertically first; when that runs out, partition data by a key such as tenant or user.",
    },
    {
      cost: "Read traffic competes with writes on the same machine.",
      mitigation: "Add read replicas for queries that can tolerate slightly delayed data, and put a cache in front of hot reads.",
    },
    {
      cost: "Schema changes on large tables can lock them or run for hours.",
      mitigation: "Use online migration tools and expand-then-contract migrations that keep old and new code working.",
    },
  ],
  interviewAngle:
    "You'll be asked how you would scale reads and then writes, which isolation level you need, and how you would shard if one primary is not enough.",
  tools: [
    { name: "PostgreSQL", kind: "self-hosted" },
    { name: "MySQL", kind: "self-hosted" },
    { name: "Amazon Aurora", kind: "managed" },
    { name: "Google Cloud SQL", kind: "managed" },
  ],
  related: ["cache", "key-value-store"],
  glossary: ["acid", "isolation-level", "read-replica", "sharding"],
  sources: [
    { title: "PostgreSQL documentation: Transaction isolation", url: "https://www.postgresql.org/docs/current/transaction-iso.html" },
    {
      title: "PostgreSQL documentation: High availability, load balancing, and replication",
      url: "https://www.postgresql.org/docs/current/high-availability.html",
    },
  ],
};
