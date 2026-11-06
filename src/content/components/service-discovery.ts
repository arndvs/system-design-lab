import type { Component } from "../types";

export const serviceDiscovery: Component = {
  id: "service-discovery",
  name: "Service Discovery",
  layer: "compute",
  oneLiner: "Keeps a live list of where each service's healthy instances are running, so callers can find them.",
  howItWorks:
    "Instances register themselves when they start and are removed when they stop or fail health checks. Callers ask the registry for a service by name, either directly or through DNS or a proxy, and get back current addresses even as instances come and go.",
  addWhen: [
    "Many services scale up and down, so instance addresses change constantly.",
    "Hard-coded addresses or manual config updates are causing outages.",
  ],
  skipWhen: [
    "Your platform already provides it, as Kubernetes Services and most managed container platforms do.",
    "A handful of services with fixed load balancer addresses.",
  ],
  tradeoffs: [
    {
      cost: "If the registry is down, services can't find each other.",
      mitigation: "Run it as a replicated cluster and let clients cache the last known addresses.",
    },
    {
      cost: "A registry can briefly list an instance that has just died.",
      mitigation: "Combine discovery with health checks and client retries to another instance.",
    },
  ],
  interviewAngle:
    "Compare client-side and server-side discovery, and explain what happens when the registry itself is unavailable.",
  tools: [
    { name: "Kubernetes Services and DNS", kind: "self-hosted" },
    { name: "HashiCorp Consul", kind: "self-hosted" },
    { name: "AWS Cloud Map", kind: "managed" },
  ],
  related: ["api-gateway", "service-mesh", "load-balancer"],
  glossary: ["health-check", "consensus"],
  sources: [
    { title: "Kubernetes documentation: Service", url: "https://kubernetes.io/docs/concepts/services-networking/service/" },
    {
      title: "Chris Richardson, microservices.io: Server-side service discovery",
      url: "https://microservices.io/patterns/server-side-discovery.html",
    },
  ],
};
