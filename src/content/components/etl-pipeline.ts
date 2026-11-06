import type { Component } from "../types";

export const etlPipeline: Component = {
  id: "etl-pipeline",
  name: "ETL Pipeline",
  layer: "analytics",
  oneLiner: "Moves data out of production systems on a schedule, cleans it up, and loads it where analysts can use it.",
  howItWorks:
    "Scheduled jobs extract new or changed records from each source, transform them into consistent shapes and units, and load them into the warehouse. An orchestrator runs the jobs in dependency order, retries failures and records what ran.",
  addWhen: [
    "You have a warehouse or data lake that needs feeding.",
    "Data from several systems must be joined, cleaned or reshaped before anyone can analyze it.",
  ],
  skipWhen: [
    "The warehouse can read directly from your database through a managed sync connector.",
  ],
  tradeoffs: [
    {
      cost: "A change to a source table can silently break downstream jobs and reports.",
      mitigation: "Agree on data contracts with source owners and add tests that check row counts and nulls.",
    },
    {
      cost: "Re-running a failed job can load the same rows twice.",
      mitigation: "Make each load idempotent by replacing a whole date partition instead of appending.",
    },
  ],
  interviewAngle:
    "Discuss batch versus streaming loads, how you would backfill history, and how you keep reruns from duplicating data.",
  tools: [
    { name: "Apache Airflow", kind: "self-hosted" },
    { name: "dbt", kind: "self-hosted" },
    { name: "AWS Glue", kind: "managed" },
    { name: "Fivetran", kind: "managed" },
  ],
  related: ["data-warehouse", "stream-processing"],
  glossary: ["idempotent", "change-data-capture"],
  sources: [
    { title: "AWS Glue Developer Guide: What is AWS Glue?", url: "https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html" },
    { title: "Apache Airflow documentation", url: "https://airflow.apache.org/docs/apache-airflow/stable/index.html" },
  ],
};
