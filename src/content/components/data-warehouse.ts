import type { Component } from "../types";

export const dataWarehouse: Component = {
  id: "data-warehouse",
  name: "Data Warehouse",
  layer: "analytics",
  oneLiner: "A separate database built for big analytical questions over all your history, kept away from live traffic.",
  howItWorks:
    "Data from your production systems is loaded into tables stored by column, so a query that sums one field across billions of rows reads only that column. Compute scales with the query, and heavy reports never touch the databases serving users.",
  addWhen: [
    "The business wants reports and dashboards across months or years of data.",
    "Analytical queries are slowing down the production database.",
    "You need to combine data from several systems in one place.",
  ],
  skipWhen: [
    "A few simple reports that a read replica can answer.",
    "Results are needed within seconds of an event, which calls for stream processing.",
  ],
  tradeoffs: [
    {
      cost: "Data arrives on a schedule, so reports are hours or a day behind.",
      mitigation: "Make freshness visible on every dashboard, and stream the few metrics that must be live.",
    },
    {
      cost: "Pay-per-query pricing can spike when someone scans a huge table.",
      mitigation: "Partition big tables by date and set per-user query limits.",
    },
  ],
  interviewAngle:
    "Explain why analytics is kept off the production database, how data gets loaded, and how fresh it needs to be.",
  tools: [
    { name: "Google BigQuery", kind: "managed" },
    { name: "Snowflake", kind: "managed" },
    { name: "Amazon Redshift", kind: "managed" },
    { name: "ClickHouse", kind: "self-hosted" },
  ],
  related: ["etl-pipeline", "stream-processing", "database-replicas"],
  glossary: ["columnar-storage", "oltp-olap"],
  sources: [
    { title: "Google Cloud: BigQuery overview", url: "https://cloud.google.com/bigquery/docs/introduction" },
    {
      title: "Amazon Redshift Database Developer Guide: System and architecture overview",
      url: "https://docs.aws.amazon.com/redshift/latest/dg/c_redshift_system_overview.html",
    },
  ],
};
