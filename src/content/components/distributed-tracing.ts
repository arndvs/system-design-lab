import type { Component } from "../types";

export const distributedTracing: Component = {
  id: "distributed-tracing",
  name: "Distributed Tracing",
  layer: "ops",
  oneLiner: "Follows a single request through every service it touches and shows where the time went.",
  howItWorks:
    "The first service gives each request a trace ID and passes it along on every outbound call. Each service records spans with start and end times under that ID, and the tracing backend stitches them into a timeline of the whole request.",
  addWhen: [
    "A request crosses several services and nobody can say which one is slow.",
    "Errors in one service show up as confusing failures in another.",
  ],
  skipWhen: [
    "A single application, where a profiler and logs already show the full request.",
  ],
  tradeoffs: [
    {
      cost: "Recording every request is expensive at high volume.",
      mitigation: "Sample a fraction of normal traffic and keep every trace that errors or runs slow.",
    },
    {
      cost: "One service that drops the trace ID breaks the chain for everything after it.",
      mitigation: "Use a standard instrumentation library everywhere so the ID is passed automatically.",
    },
  ],
  interviewAngle:
    "Explain how context is propagated, how you'd sample, and how traces, metrics and logs work together to find a problem.",
  tools: [
    { name: "OpenTelemetry", kind: "self-hosted" },
    { name: "Jaeger", kind: "self-hosted" },
    { name: "Grafana Tempo", kind: "self-hosted" },
    { name: "AWS X-Ray", kind: "managed" },
  ],
  related: ["metrics-monitoring", "centralized-logging", "service-mesh"],
  glossary: ["correlation-id", "percentile-latency"],
  sources: [
    { title: "OpenTelemetry: Traces", url: "https://opentelemetry.io/docs/concepts/signals/traces/" },
    {
      title: "Sigelman et al., Dapper, a Large-Scale Distributed Systems Tracing Infrastructure (Google, 2010)",
      url: "https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/",
    },
  ],
};
