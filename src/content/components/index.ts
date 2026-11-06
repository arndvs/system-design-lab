import type { Component } from "../types";
import { cache } from "./cache";
import { cdn } from "./cdn";
import { centralizedLogging } from "./centralized-logging";
import { keyValueStore } from "./key-value-store";
import { loadBalancer } from "./load-balancer";
import { messageQueue } from "./message-queue";
import { metricsMonitoring } from "./metrics-monitoring";
import { relationalDatabase } from "./relational-database";

const all: Component[] = [
  cdn,
  loadBalancer,
  relationalDatabase,
  keyValueStore,
  cache,
  messageQueue,
  metricsMonitoring,
  centralizedLogging,
];

export const components: Record<string, Component> = Object.fromEntries(all.map((c) => [c.id, c]));
export const componentList = all;
