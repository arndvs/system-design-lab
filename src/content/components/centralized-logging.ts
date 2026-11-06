import type { Component } from "../types";

export const centralizedLogging: Component = {
  id: "centralized-logging",
  name: "Centralized Logging",
  layer: "ops",
  oneLiner: "Collects every server's event records in one searchable place so you can reconstruct what happened.",
  howItWorks:
    "Each process writes events to standard output, ideally as structured JSON. An agent on every machine ships them to a central store that indexes them, so you can filter by service, request ID or error across the whole fleet instead of logging in to individual servers.",
  addWhen: [
    "You run more than one server or container. This is baseline, not an optional extra.",
    "You need an audit trail of who did what and when.",
    "Debugging requires following one request through several components.",
  ],
  skipWhen: [
    "Only for a single-process prototype where reading local output is enough.",
  ],
  tradeoffs: [
    {
      cost: "Log volume grows with traffic, and indexing and storage get expensive.",
      mitigation: "Set retention per log level, sample noisy debug logs, and archive old data to cheap object storage.",
    },
    {
      cost: "Logs can capture passwords, tokens or personal data by accident.",
      mitigation: "Redact known sensitive fields in the logging library and restrict who can search the store.",
    },
  ],
  interviewAngle:
    "Discuss structured logs, correlation IDs across services, retention cost, and how logs differ from metrics and traces.",
  tools: [
    { name: "OpenSearch", kind: "self-hosted" },
    { name: "Grafana Loki", kind: "self-hosted" },
    { name: "Fluent Bit", kind: "self-hosted" },
    { name: "Datadog Logs", kind: "managed" },
  ],
  related: ["metrics-monitoring"],
  glossary: ["structured-logging", "correlation-id"],
  sources: [
    { title: "The Twelve-Factor App: XI. Logs", url: "https://12factor.net/logs" },
    { title: "OpenTelemetry: Logs", url: "https://opentelemetry.io/docs/concepts/signals/logs/" },
  ],
};
