import type { Component } from "../types";

export const rateLimiter: Component = {
  id: "rate-limiter",
  name: "Rate Limiter",
  layer: "edge",
  oneLiner: "Caps how many requests each user, key or address can make in a time window, and turns away the rest.",
  howItWorks:
    "For every request, the limiter looks up a counter for the caller and checks it against the allowance, using an algorithm such as token bucket or sliding window. Requests over the limit get HTTP 429 with a hint for when to retry. Counters live in a fast shared store so every server enforces the same limit.",
  addWhen: [
    "Login or sign-up forms could be hammered by password-guessing or bots.",
    "A public API must stop one client from using up capacity meant for everyone.",
    "Expensive endpoints need protection from accidental retry storms.",
  ],
  skipWhen: [
    "Only trusted internal callers with their own back-pressure.",
  ],
  tradeoffs: [
    {
      cost: "Every request pays for a counter lookup.",
      mitigation: "Keep counters in memory close to the servers, or enforce coarse limits at the edge.",
    },
    {
      cost: "Limits set too low block real users during legitimate peaks.",
      mitigation: "Start in log-only mode, set limits from observed traffic, and give trusted clients higher tiers.",
    },
  ],
  interviewAngle:
    "Expect to compare token bucket and sliding window, say where the counters live, and explain behavior when the counter store is down.",
  tools: [
    { name: "Cloudflare Rate Limiting", kind: "managed" },
    { name: "AWS WAF rate-based rules", kind: "managed" },
    { name: "Envoy rate limit service", kind: "self-hosted" },
    { name: "Redis", kind: "self-hosted" },
  ],
  related: ["api-gateway", "auth-service", "cache"],
  glossary: ["token-bucket", "back-pressure"],
  sources: [
    { title: "Stripe engineering blog: Scaling your API with rate limiters", url: "https://stripe.com/blog/rate-limiters" },
    {
      title: "IETF RFC 6585: Additional HTTP Status Codes (429 Too Many Requests)",
      url: "https://datatracker.ietf.org/doc/html/rfc6585",
    },
  ],
};
