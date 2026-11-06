import type { Component } from "../types";

export const loadBalancer: Component = {
  id: "load-balancer",
  name: "Load Balancer",
  layer: "entry",
  oneLiner: "Spreads incoming requests over a pool of identical servers and stops sending work to any that fail.",
  howItWorks:
    "Clients connect to one address owned by the balancer. It picks a healthy backend for each connection or request using a policy such as round robin or least connections, and probes backends on a schedule so a crashed server drops out of rotation within seconds.",
  addWhen: [
    "You run more than one copy of the application server, for capacity or for redundancy.",
    "A single machine can no longer keep up with peak traffic.",
    "You need to deploy without downtime by draining servers one at a time.",
  ],
  skipWhen: [
    "One server comfortably handles peak load and a few minutes of downtime is acceptable.",
    "A managed platform already balances traffic for you, as most serverless and PaaS offerings do.",
  ],
  tradeoffs: [
    {
      cost: "The balancer becomes the one thing every request passes through, so its failure takes the whole site down.",
      mitigation: "Run it as an active-passive pair with a floating IP, or use a cloud balancer that is redundant across zones.",
    },
    {
      cost: "Sticky sessions pin users to one server, which unbalances load and loses sessions when that server dies.",
      mitigation: "Keep servers stateless and move session data into a shared store such as a cache.",
    },
    {
      cost: "Health checks that only test that a port is open will keep routing to a server whose app is broken.",
      mitigation: "Point health checks at an endpoint that exercises the app and its critical dependencies.",
    },
  ],
  interviewAngle:
    "Expect questions on layer 4 versus layer 7 balancing, which algorithm you would choose and why, and how the balancer itself avoids being a single point of failure.",
  tools: [
    { name: "AWS Elastic Load Balancing", kind: "managed" },
    { name: "Google Cloud Load Balancing", kind: "managed" },
    { name: "NGINX", kind: "self-hosted" },
    { name: "HAProxy", kind: "self-hosted" },
    { name: "Envoy", kind: "self-hosted" },
  ],
  related: ["cdn", "cache"],
  glossary: ["health-check", "stateless", "single-point-of-failure"],
  sources: [
    { title: "NGINX: HTTP load balancing", url: "https://nginx.org/en/docs/http/load_balancing.html" },
    {
      title: "AWS: What is Elastic Load Balancing?",
      url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html",
    },
  ],
};
