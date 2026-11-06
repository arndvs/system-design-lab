import type { Component } from "../types";
import { apiGateway } from "./api-gateway";
import { appServers } from "./app-servers";
import { authService } from "./auth-service";
import { cache } from "./cache";
import { cdn } from "./cdn";
import { centralizedLogging } from "./centralized-logging";
import { databaseReplicas } from "./database-replicas";
import { dataWarehouse } from "./data-warehouse";
import { distributedTracing } from "./distributed-tracing";
import { documentDatabase } from "./document-database";
import { etlPipeline } from "./etl-pipeline";
import { graphDatabase } from "./graph-database";
import { keyValueStore } from "./key-value-store";
import { loadBalancer } from "./load-balancer";
import { messageQueue } from "./message-queue";
import { metricsMonitoring } from "./metrics-monitoring";
import { objectStorage } from "./object-storage";
import { rateLimiter } from "./rate-limiter";
import { relationalDatabase } from "./relational-database";
import { searchIndex } from "./search-index";
import { serviceDiscovery } from "./service-discovery";
import { serviceMesh } from "./service-mesh";
import { streamProcessing } from "./stream-processing";

/** Ordered roughly along a request's path, which is also the display order. */
const all: Component[] = [
  // edge
  cdn,
  rateLimiter,
  // entry
  loadBalancer,
  apiGateway,
  authService,
  // compute
  appServers,
  serviceDiscovery,
  serviceMesh,
  // data
  cache,
  relationalDatabase,
  keyValueStore,
  documentDatabase,
  graphDatabase,
  databaseReplicas,
  searchIndex,
  objectStorage,
  // async
  messageQueue,
  streamProcessing,
  // analytics
  etlPipeline,
  dataWarehouse,
  // ops
  metricsMonitoring,
  centralizedLogging,
  distributedTracing,
];

export const components: Record<string, Component> = Object.fromEntries(all.map((c) => [c.id, c]));
export const componentList = all;
/** Position of each component in display order. */
export const componentOrder: Record<string, number> = Object.fromEntries(all.map((c, i) => [c.id, i]));
