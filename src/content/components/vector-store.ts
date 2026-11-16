import type { Component } from "../types";

export const vectorStore: Component = {
  id: "vector-store",
  name: "Vector Store",
  layer: "data",
  oneLiner: "Stores embeddings of your content and finds the passages closest in meaning to a question.",
  howItWorks:
    "Each document is split into passages, and an embedding model turns every passage into a list of numbers that captures its meaning. The store indexes those vectors so that, given a question's embedding, it returns the nearest passages. Exact search compares against every vector; large stores use an approximate index, such as HNSW, that checks far fewer vectors and occasionally misses a close one.",
  addWhen: [
    "A language model must answer from your own documents rather than from what it learned in training.",
    "Users search by meaning, where the words in the question may not appear in the answer.",
    "You need to find similar items, such as related articles or duplicate tickets.",
  ],
  skipWhen: [
    "Your content is small enough to send to the model in full with every request.",
    "Users search for exact words, names or codes, where a keyword index is simpler and more precise.",
  ],
  tradeoffs: [
    {
      cost: "Approximate indexes trade some recall for speed, so the best passage is occasionally missed.",
      mitigation: "Measure recall on real questions, tune the index's search settings, and retrieve a few more passages than you show.",
    },
    {
      cost: "Embeddings go stale when documents change, and every vector must be rebuilt when you switch embedding models.",
      mitigation: "Re-embed changed documents as they are saved, and version the embedding model alongside the index.",
    },
    {
      cost: "Search by meaning is weak on exact terms such as product codes and names.",
      mitigation: "Combine it with keyword search and merge the two result lists (hybrid search).",
    },
  ],
  interviewAngle:
    "Expect to explain chunking, how you would measure retrieval quality separately from answer quality, how documents stay in sync, and when keyword or hybrid search beats vectors alone.",
  tools: [
    { name: "pgvector", kind: "self-hosted" },
    { name: "Qdrant", kind: "self-hosted" },
    { name: "Pinecone", kind: "managed" },
    { name: "OpenSearch", kind: "self-hosted" },
  ],
  related: ["search-index", "relational-database", "model-gateway"],
  glossary: ["embedding", "retrieval-augmented-generation", "approximate-nearest-neighbor"],
  sources: [
    {
      title: "Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (2020)",
      url: "https://arxiv.org/abs/2005.11401",
    },
    {
      title: "Malkov and Yashunin, Efficient and robust approximate nearest neighbor search using HNSW graphs",
      url: "https://arxiv.org/abs/1603.09320",
    },
    { title: "pgvector: open-source vector similarity search for Postgres", url: "https://github.com/pgvector/pgvector" },
  ],
};
