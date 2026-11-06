import type { Component } from "../types";

export const serviceMesh: Component = {
  id: "service-mesh",
  name: "Service Mesh",
  layer: "compute",
  oneLiner: "A network layer that gives every service-to-service call encryption, retries and metrics without code changes.",
  howItWorks:
    "A proxy runs next to each service instance and handles all of its network traffic. A central control plane configures those proxies, so policies such as mutual TLS, retries, timeouts and traffic splitting apply everywhere at once.",
  addWhen: [
    "Dozens of services, often in several languages, each re-implementing retries, timeouts and TLS.",
    "You need encrypted, authenticated traffic between all services for compliance.",
    "You want gradual rollouts that shift a percentage of traffic to a new version.",
  ],
  skipWhen: [
    "Fewer than about a dozen services, where a shared library is cheaper to run.",
    "The team has no capacity to operate another piece of critical infrastructure.",
  ],
  tradeoffs: [
    {
      cost: "Every call passes through extra proxies, adding latency and CPU.",
      mitigation: "Measure the overhead before and after, and consider sidecar-free modes where supported.",
    },
    {
      cost: "It is complex, and misconfiguration can break traffic between every service at once.",
      mitigation: "Adopt it gradually, one namespace at a time, with config changes reviewed and rolled out slowly.",
    },
  ],
  interviewAngle:
    "Expect to say what problems justify a mesh, what it costs, and what a simpler alternative would be at your scale.",
  tools: [
    { name: "Istio", kind: "self-hosted" },
    { name: "Linkerd", kind: "self-hosted" },
    { name: "Consul service mesh", kind: "self-hosted" },
  ],
  related: ["service-discovery", "distributed-tracing", "api-gateway"],
  glossary: ["mtls"],
  sources: [
    { title: "Istio documentation: What is Istio?", url: "https://istio.io/latest/docs/overview/what-is-istio/" },
    { title: "Linkerd: What is a service mesh?", url: "https://linkerd.io/what-is-a-service-mesh/" },
  ],
};
