import type { Component } from "../types";

export const metricsMonitoring: Component = {
  id: "metrics-monitoring",
  name: "Metrics & Alerting",
  layer: "ops",
  oneLiner: "Records numbers about the system over time and pages someone when they show users are being hurt.",
  howItWorks:
    "Services expose counters and timings such as request rate, error rate and latency percentiles. A monitoring system collects them every few seconds, stores them as time series, draws dashboards, and evaluates alert rules against them.",
  addWhen: [
    "Anything is running in production. This is baseline, not an optional extra.",
    "You need to know about an outage before your users report it.",
    "You want data, not guesses, when deciding what to scale next.",
  ],
  skipWhen: [
    "Only for throwaway prototypes that nobody depends on.",
  ],
  tradeoffs: [
    {
      cost: "Too many alerts train people to ignore them.",
      mitigation: "Alert on symptoms users feel, like errors and latency, and send cause-level signals to dashboards instead.",
    },
    {
      cost: "Labels with unbounded values, such as user IDs, multiply time series and storage cost.",
      mitigation: "Keep labels to small fixed sets and put per-request detail in logs or traces.",
    },
  ],
  interviewAngle:
    "Name the signals you would watch (latency, traffic, errors, saturation), the SLOs you would set, and what would actually page someone.",
  tools: [
    { name: "Prometheus", kind: "self-hosted" },
    { name: "Grafana", kind: "self-hosted" },
    { name: "Datadog", kind: "managed" },
    { name: "Amazon CloudWatch", kind: "managed" },
  ],
  related: ["centralized-logging"],
  glossary: ["slo", "golden-signals", "percentile-latency"],
  sources: [
    {
      title: "Google SRE Book, ch. 6: Monitoring Distributed Systems",
      url: "https://sre.google/sre-book/monitoring-distributed-systems/",
    },
    { title: "Prometheus documentation: Overview", url: "https://prometheus.io/docs/introduction/overview/" },
  ],
};
