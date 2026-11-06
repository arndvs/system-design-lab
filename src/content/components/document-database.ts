import type { Component } from "../types";

export const documentDatabase: Component = {
  id: "document-database",
  name: "Document Database",
  layer: "data",
  oneLiner: "Stores each record as a self-contained JSON-like document, so data read together is stored together.",
  howItWorks:
    "A document holds an entity and its nested parts, such as an article with its tags and authors, and you can query and index fields inside it. Documents in one collection don't need identical fields, and collections can be sharded by a key to spread load across machines.",
  addWhen: [
    "Records are naturally nested and usually read whole, like profiles, catalogs or content.",
    "Different records of the same type carry different fields.",
    "You expect to shard by a natural key such as user or tenant.",
  ],
  skipWhen: [
    "Most queries join many entity types together.",
    "Many records share sub-data that must stay in sync, which would be duplicated across documents.",
  ],
  tradeoffs: [
    {
      cost: "Data copied into many documents drifts out of sync when one copy is updated.",
      mitigation: "Embed data that belongs to one parent; reference shared data by ID instead.",
    },
    {
      cost: "Without a schema, bad or inconsistent data gets in silently.",
      mitigation: "Turn on schema validation for collections and validate in the application.",
    },
    {
      cost: "Default read settings can return data that a later failover rolls back.",
      mitigation: "Use majority read and write concerns for data that must not be lost or seen stale.",
    },
  ],
  interviewAngle:
    "Interviewers ask when you embed versus reference, how you'd pick a shard key, and which read and write concerns you'd use.",
  tools: [
    { name: "MongoDB", kind: "self-hosted" },
    { name: "MongoDB Atlas", kind: "managed" },
    { name: "Amazon DocumentDB", kind: "managed" },
    { name: "Google Firestore", kind: "managed" },
  ],
  related: ["relational-database", "key-value-store", "database-replicas"],
  glossary: ["sharding", "partition-key", "eventual-consistency"],
  sources: [
    { title: "MongoDB Manual: Data modeling", url: "https://www.mongodb.com/docs/manual/data-modeling/" },
    { title: "MongoDB Manual: Read concern", url: "https://www.mongodb.com/docs/manual/reference/read-concern/" },
  ],
};
