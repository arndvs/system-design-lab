import type { Component } from "../types";

export const graphDatabase: Component = {
  id: "graph-database",
  name: "Graph Database",
  layer: "data",
  oneLiner: "Stores things and the connections between them, and follows chains of connections quickly.",
  howItWorks:
    "Data is modeled as nodes, like people or products, and edges, like follows or bought. Each node points directly at its neighbors, so a query that hops several connections deep walks those pointers instead of running repeated joins over large tables.",
  addWhen: [
    "Questions are about paths and neighborhoods: friends of friends, fraud rings, recommendations.",
    "Queries routinely traverse three or more levels of relationships.",
  ],
  skipWhen: [
    "Relationships are shallow and fixed, which a relational database handles with ordinary joins.",
    "Most work is aggregation over many records rather than traversal.",
  ],
  tradeoffs: [
    {
      cost: "Graphs are hard to split across machines because connections cross any partition you draw.",
      mitigation: "Keep the graph to relationships only and store bulky attributes elsewhere.",
    },
    {
      cost: "Fewer engineers know graph query languages and modeling.",
      mitigation: "Start with one well-understood use case and keep the main records in your primary database.",
    },
  ],
  interviewAngle:
    "Be ready to show why traversal beats joins for your query, and how you'd handle a graph that outgrows one machine.",
  tools: [
    { name: "Neo4j", kind: "self-hosted" },
    { name: "Amazon Neptune", kind: "managed" },
    { name: "Memgraph", kind: "self-hosted" },
  ],
  related: ["relational-database", "cache"],
  glossary: ["sharding"],
  sources: [
    { title: "Amazon Neptune User Guide: What is Amazon Neptune?", url: "https://docs.aws.amazon.com/neptune/latest/userguide/intro.html" },
    { title: "Neo4j: Graph database concepts", url: "https://neo4j.com/docs/getting-started/graph-database/" },
  ],
};
