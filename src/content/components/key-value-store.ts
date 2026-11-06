import type { Component } from "../types";

export const keyValueStore: Component = {
  id: "key-value-store",
  name: "Key-Value Store",
  layer: "data",
  oneLiner: "Fetches and saves records by a single key, and scales out by spreading keys across many machines.",
  howItWorks:
    "Each record is addressed by a key that is hashed to decide which partition, and so which servers, hold it. Because every operation targets one partition, adding machines adds capacity almost linearly. Many stores let you choose per request between faster eventually consistent reads and strongly consistent ones.",
  addWhen: [
    "Almost every access is get-by-ID or put-by-ID, for example sessions, carts, profiles or short links.",
    "Traffic or data size will outgrow what one database primary can handle.",
    "You want capacity that grows by adding nodes rather than buying a bigger server.",
  ],
  skipWhen: [
    "You need joins, ad-hoc queries or transactions spanning many unrelated records.",
    "The data set is small enough that a single relational database handles it easily.",
  ],
  tradeoffs: [
    {
      cost: "Queries you didn't plan for are slow or impossible, because data is organized around the key.",
      mitigation: "List access patterns before designing keys, and add secondary indexes for the few other lookups you need.",
    },
    {
      cost: "One very popular key lands on one partition and can overload it.",
      mitigation: "Spread hot keys by adding a suffix, and cache the hottest items in front of the store.",
    },
    {
      cost: "Default reads may return slightly old data right after a write.",
      mitigation: "Request strongly consistent reads where correctness depends on them; many stores offer this per read.",
    },
  ],
  interviewAngle:
    "Interviewers probe partition key choice, hot partitions, and how quorum settings or read modes trade latency for consistency.",
  tools: [
    { name: "Amazon DynamoDB", kind: "managed" },
    { name: "Google Cloud Bigtable", kind: "managed" },
    { name: "Apache Cassandra", kind: "self-hosted" },
    { name: "ScyllaDB", kind: "self-hosted" },
  ],
  related: ["cache", "relational-database"],
  glossary: ["partition-key", "eventual-consistency", "quorum", "sharding"],
  sources: [
    {
      title: "DeCandia et al., Dynamo: Amazon's Highly Available Key-value Store (SOSP 2007)",
      url: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
    },
    {
      title: "Amazon DynamoDB Developer Guide: Read consistency",
      url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html",
    },
  ],
};
