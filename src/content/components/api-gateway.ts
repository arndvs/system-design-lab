import type { Component } from "../types";

export const apiGateway: Component = {
  id: "api-gateway",
  name: "API Gateway",
  layer: "entry",
  oneLiner: "One front door for many backend services that handles shared concerns like auth, routing and limits.",
  howItWorks:
    "Clients call the gateway instead of each service. It checks credentials, applies rate limits, routes each path to the right service and can combine several service responses into one. Shared concerns are then written once instead of in every service.",
  addWhen: [
    "Clients would otherwise need to know the addresses of many services.",
    "Every service would repeat the same authentication, rate limiting and logging.",
    "Mobile clients need fewer, larger responses assembled from several services.",
  ],
  skipWhen: [
    "You run a single application; a load balancer and middleware in the app do the job.",
  ],
  tradeoffs: [
    {
      cost: "Every request takes an extra network hop.",
      mitigation: "Keep gateway logic thin and run it close to the services.",
    },
    {
      cost: "Business logic creeps into the gateway until it becomes a bottleneck every team must change.",
      mitigation: "Limit the gateway to cross-cutting concerns and keep domain logic in services.",
    },
    {
      cost: "If it fails, every service becomes unreachable.",
      mitigation: "Run several stateless instances behind a load balancer across zones.",
    },
  ],
  interviewAngle:
    "Expect to justify what belongs in the gateway versus the services, and how you would avoid it becoming a single point of failure.",
  tools: [
    { name: "Amazon API Gateway", kind: "managed" },
    { name: "Kong", kind: "self-hosted" },
    { name: "Envoy Gateway", kind: "self-hosted" },
    { name: "Apigee", kind: "managed" },
  ],
  related: ["load-balancer", "auth-service", "rate-limiter", "service-discovery"],
  glossary: ["single-point-of-failure"],
  sources: [
    { title: "Chris Richardson, microservices.io: API gateway pattern", url: "https://microservices.io/patterns/apigateway.html" },
    {
      title: "Microsoft Azure Architecture Center: Use API gateways in microservices",
      url: "https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway",
    },
  ],
};
