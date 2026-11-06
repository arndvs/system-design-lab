import type { Component } from "../types";

export const streamProcessing: Component = {
  id: "stream-processing",
  name: "Stream Processing",
  layer: "async",
  oneLiner: "Computes results continuously as events arrive, such as live counts, trends or fraud scores.",
  howItWorks:
    "Events flow from a durable log into a processing job that keeps running state, like a count per minute or per user. The job groups events into time windows and emits updated results within seconds. It checkpoints its state so it can resume after a crash without double counting.",
  addWhen: [
    "Dashboards, alerts or features must reflect events within seconds, not after a nightly batch.",
    "You need running aggregates over a firehose of events, like views per video.",
    "Each event must be checked against recent history, as in fraud detection.",
  ],
  skipWhen: [
    "Results can be minutes or hours old, so a scheduled batch job is simpler.",
    "Event volume is small enough to update counters directly in the database.",
  ],
  tradeoffs: [
    {
      cost: "Events arrive late or out of order, which makes window results wrong.",
      mitigation: "Window by event time with watermarks, and decide how late an event may still count.",
    },
    {
      cost: "Long-running stateful jobs are hard to upgrade and debug.",
      mitigation: "Use a managed service where possible and version the job's state between deploys.",
    },
  ],
  interviewAngle:
    "Interviewers ask about event time versus processing time, windows, exactly-once claims, and how you'd recover from a crashed job.",
  tools: [
    { name: "Apache Flink", kind: "self-hosted" },
    { name: "Kafka Streams", kind: "self-hosted" },
    { name: "Amazon Managed Service for Apache Flink", kind: "managed" },
    { name: "Google Cloud Dataflow", kind: "managed" },
  ],
  related: ["message-queue", "data-warehouse"],
  glossary: ["windowing", "at-least-once", "idempotent"],
  sources: [
    {
      title: "Apache Flink documentation: Concepts overview",
      url: "https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/overview/",
    },
    { title: "Apache Kafka documentation", url: "https://kafka.apache.org/documentation/" },
  ],
};
