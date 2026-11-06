import type { Requirements } from "./types";

export type Scenario = {
  id: string;
  title: string;
  brief: string;
  requirements: Requirements;
  /** The reference answer. Tests check that the engine produces exactly this. */
  expected: string[];
  walkthrough: string[];
};

export const scenarios: Scenario[] = [
  {
    id: "url-shortener",
    title: "URL shortener",
    brief: "Turn long links into short codes and redirect anyone who opens one. Around 100 million new links a month, read far more than written.",
    requirements: {
      peakRps: 8000,
      readWriteRatio: 100,
      dataShape: "key-value",
      strongConsistency: false,
      highAvailability: true,
      globalUsers: false,
      lowLatency: true,
      eventDriven: false,
      mediaUploads: false,
    },
    expected: ["key-value-store", "load-balancer", "cache", "metrics-monitoring", "centralized-logging"],
    walkthrough: [
      "Every lookup is by short code, so a key-value store fits and scales by adding partitions.",
      "Redirects must stay up and peak at thousands per second, so several stateless servers sit behind a load balancer.",
      "Popular links are clicked over and over; at 100 reads per write, a cache absorbs most lookups.",
      "Metrics and logs are baseline: you need to see redirect latency and error rate from day one.",
    ],
  },
  {
    id: "order-checkout",
    title: "Online store checkout",
    brief: "Take payment, reserve stock and record the order. Totals must always be correct, and confirmation emails can arrive a little later.",
    requirements: {
      peakRps: 400,
      readWriteRatio: 3,
      dataShape: "relational",
      strongConsistency: true,
      highAvailability: true,
      globalUsers: false,
      lowLatency: false,
      eventDriven: true,
      mediaUploads: false,
    },
    expected: ["relational-database", "load-balancer", "message-queue", "metrics-monitoring", "centralized-logging"],
    walkthrough: [
      "Orders, line items, stock and payments reference each other and must change together, so a relational database with transactions fits.",
      "Checkout can't go down, so run redundant app servers behind a load balancer, even though traffic is modest.",
      "Emails and warehouse notifications go through a queue, so a slow email provider never delays a purchase.",
      "There's no cache: reads aren't dominant, and stale stock counts would cause overselling.",
    ],
  },
];
