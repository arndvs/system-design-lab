import type { Component } from "../types";

export const searchIndex: Component = {
  id: "search-index",
  name: "Search Index",
  layer: "data",
  oneLiner: "Answers free-text queries like \"red running shoes\" in milliseconds, ranked by relevance.",
  howItWorks:
    "Text is split into terms and stored in an inverted index that maps each term to the documents containing it, so a query looks up a few lists instead of scanning every row. The index is a copy built from your main database, kept up to date by a sync process.",
  addWhen: [
    "Users type free text and expect relevant results, typo tolerance or filters with counts.",
    "LIKE queries on the database are slow or can't rank results.",
    "You need to search across logs or documents at volume.",
  ],
  skipWhen: [
    "Lookups are by exact ID or a few indexed columns.",
    "The data set is small and the database's built-in full-text search is good enough.",
  ],
  tradeoffs: [
    {
      cost: "The index lags behind the database, so new or edited items take a moment to appear in results.",
      mitigation: "Stream changes from the database into the index and tell users when results may be delayed.",
    },
    {
      cost: "It is a second system to run, size and keep in sync.",
      mitigation: "Treat the database as the source of truth and keep a script that can rebuild the index from it.",
    },
    {
      cost: "Good relevance takes tuning; default ranking often disappoints.",
      mitigation: "Log queries with no clicks and tune fields, synonyms and boosts against them.",
    },
  ],
  interviewAngle:
    "Explain how data gets from the database into the index, how you would shard it, and how you keep results fresh enough.",
  tools: [
    { name: "OpenSearch", kind: "self-hosted" },
    { name: "Elasticsearch", kind: "self-hosted" },
    { name: "Apache Solr", kind: "self-hosted" },
    { name: "Algolia", kind: "managed" },
  ],
  related: ["relational-database", "document-database"],
  glossary: ["inverted-index", "change-data-capture"],
  sources: [
    {
      title: "Manning, Raghavan & Schütze, Introduction to Information Retrieval (Cambridge University Press, 2008)",
      url: "https://nlp.stanford.edu/IR-book/",
    },
    { title: "OpenSearch documentation", url: "https://opensearch.org/docs/latest/" },
  ],
};
