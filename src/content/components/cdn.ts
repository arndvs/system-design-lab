import type { Component } from "../types";

export const cdn: Component = {
  id: "cdn",
  name: "CDN",
  layer: "edge",
  oneLiner: "Serves copies of your content from servers near each user, so most requests never travel to your origin.",
  howItWorks:
    "A content delivery network runs caching servers in many cities. The first request for a file in a region is fetched from your origin and stored at that edge location, and later requests there are answered locally until the cached copy expires according to its HTTP cache headers.",
  addWhen: [
    "Users are spread across continents and round trips to one region are noticeably slow.",
    "Pages lean on images, video, scripts or downloads that many users request.",
    "You want a buffer that absorbs traffic spikes and some denial-of-service attacks before they reach you.",
  ],
  skipWhen: [
    "Nearly all users sit in the same region as your servers.",
    "Responses are personalized per user and cannot be cached at all.",
  ],
  tradeoffs: [
    {
      cost: "Users can see an old version of a file after you change it.",
      mitigation: "Put a content hash in asset file names so every release gets new URLs, and keep purges for emergencies.",
    },
    {
      cost: "A wrong cache header can store one user's private page and serve it to others.",
      mitigation: "Mark personalized responses private or no-store, and review cache rules whenever routes change.",
    },
    {
      cost: "Bandwidth is billed per gigabyte, which adds up for large or rarely requested files.",
      mitigation: "Watch the hit ratio and send rarely requested large objects straight from storage.",
    },
  ],
  interviewAngle:
    "Interviewers ask how you invalidate content, push versus pull CDNs, and what you would and would not cache at the edge.",
  tools: [
    { name: "Cloudflare", kind: "managed" },
    { name: "Amazon CloudFront", kind: "managed" },
    { name: "Fastly", kind: "managed" },
    { name: "Akamai", kind: "managed" },
  ],
  related: ["cache", "load-balancer"],
  glossary: ["ttl", "cache-hit-ratio", "origin"],
  sources: [
    { title: "MDN: HTTP caching", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching" },
    { title: "Cloudflare Learning Center: What is a CDN?", url: "https://www.cloudflare.com/learning/cdn/what-is-a-cdn/" },
  ],
};
