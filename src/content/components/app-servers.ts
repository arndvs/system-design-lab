import type { Component } from "../types";

export const appServers: Component = {
  id: "app-servers",
  name: "Application Servers",
  layer: "compute",
  oneLiner: "Run your code: they take a request, apply the business logic, talk to storage and send back a response.",
  howItWorks:
    "Each server runs the same build of your application. When they keep no user state in local memory or disk, any copy can serve any request, so you scale by starting more copies and recover from a crash by replacing one.",
  addWhen: [
    "Always. Every design needs somewhere for its logic to run.",
    "Scale out to several copies once one machine is not enough or a single failure would be an outage.",
  ],
  skipWhen: [
    "The work is purely static files, which object storage and a CDN can serve with no servers at all.",
    "You choose functions-as-a-service, where the provider runs and scales the code for you.",
  ],
  tradeoffs: [
    {
      cost: "State kept on one server, like an in-memory session, is lost when that server dies and pins users to it.",
      mitigation: "Move sessions and uploads to shared stores so every copy is interchangeable.",
    },
    {
      cost: "A slow dependency ties up server threads until requests start timing out everywhere.",
      mitigation: "Set timeouts on every outbound call and cap how many calls can wait on one dependency.",
    },
  ],
  interviewAngle:
    "Interviewers check that you keep servers stateless, know when to scale up versus out, and can say what each server does per request.",
  tools: [
    { name: "Kubernetes", kind: "self-hosted" },
    { name: "Amazon ECS", kind: "managed" },
    { name: "Google Cloud Run", kind: "managed" },
    { name: "AWS Lambda", kind: "managed" },
  ],
  related: ["load-balancer", "service-discovery"],
  glossary: ["stateless", "horizontal-scaling"],
  sources: [
    { title: "The Twelve-Factor App: VI. Processes", url: "https://12factor.net/processes" },
    { title: "The Twelve-Factor App: VIII. Concurrency", url: "https://12factor.net/concurrency" },
  ],
};
