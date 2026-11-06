import type { Component } from "../types";

export const databaseReplicas: Component = {
  id: "database-replicas",
  name: "Database Replicas",
  layer: "data",
  oneLiner: "Extra copies of the database that stay in step with the primary, ready to take over or to answer reads.",
  howItWorks:
    "The primary streams every change to its replicas. A standby replica in another zone can be promoted if the primary fails, and read replicas share the query load. Synchronous replication waits for a replica before confirming a write, so nothing is lost on failover; asynchronous replication confirms first, which is faster but can lose the last few writes.",
  addWhen: [
    "The availability target can't survive the hours it takes to rebuild a failed database.",
    "Reads dominate and the primary is busy answering them.",
    "Reporting queries slow down the live workload and could run on a separate copy.",
  ],
  skipWhen: [
    "The target allows hours of downtime and backups alone meet your recovery goals.",
    "The bottleneck is writes; replicas copy every write, so they add no write capacity.",
  ],
  tradeoffs: [
    {
      cost: "Asynchronous replicas lag, so a user may not see their own change if the next read hits a replica.",
      mitigation: "Send a user's reads to the primary for a short window after they write, or for data that must be current.",
    },
    {
      cost: "Synchronous replication adds the round trip to the replica to every write.",
      mitigation: "Keep the synchronous standby in a nearby zone and use asynchronous replicas for distant regions.",
    },
    {
      cost: "A failover that isn't tested can fail when it is finally needed.",
      mitigation: "Rehearse promotions regularly and automate the switch of the connection endpoint.",
    },
  ],
  interviewAngle:
    "You'll be asked about synchronous versus asynchronous replication, replication lag, read-your-writes, and what happens to in-flight writes during failover.",
  tools: [
    { name: "PostgreSQL streaming replication", kind: "self-hosted" },
    { name: "MySQL replication", kind: "self-hosted" },
    { name: "Amazon RDS Multi-AZ and read replicas", kind: "managed" },
  ],
  related: ["relational-database", "document-database", "cache"],
  glossary: ["read-replica", "replication-lag", "failover", "read-your-writes"],
  sources: [
    { title: "PostgreSQL documentation: Hot standby", url: "https://www.postgresql.org/docs/current/hot-standby.html" },
    {
      title: "Amazon RDS User Guide: Working with read replicas",
      url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html",
    },
  ],
};
