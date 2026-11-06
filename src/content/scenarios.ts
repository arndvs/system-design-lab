import { defaultRequirements } from "../engine/recommend";
import type { Requirements, Topology } from "./types";

export type Scenario = {
  id: string;
  title: string;
  brief: string;
  /** The brief's requirements, sorted the way an interviewer expects. */
  functional: string[];
  nonFunctional: string[];
  requirements: Requirements;
  /** The reference answer. Tests check that the engine produces exactly this. */
  expected: { components: string[]; shape: "modular-monolith" | "microservices"; topology: Topology; tensions: string[] };
  walkthrough: string[];
};

const req = (over: Partial<Requirements>): Requirements => ({ ...defaultRequirements, ...over });

export const scenarios: Scenario[] = [
  {
    id: "url-shortener",
    title: "URL shortener",
    brief:
      "Turn long links into short codes and redirect anyone who opens one. About 100 million new links a month, opened far more often than created.",
    functional: ["Create a short code for a long URL.", "Redirect anyone who opens a short code to the original URL."],
    nonFunctional: [
      "Redirects stay up 99.99% of the time.",
      "Redirects respond within 50 ms at the 99th percentile.",
      "Handle 8,000 requests per second at peak, about 100 reads per write.",
    ],
    requirements: req({
      dataShape: "key-value",
      peakRps: 8000,
      readWriteRatio: 100,
      availability: 99.99,
      latencyMs: 50,
    }),
    expected: {
      components: ["load-balancer", "app-servers", "cache", "key-value-store", "metrics-monitoring", "centralized-logging"],
      shape: "modular-monolith",
      topology: "multi-zone",
      tensions: [],
    },
    walkthrough: [
      "Every lookup is by short code, so a key-value store fits, and it replicates and partitions on its own.",
      "At 99.99%, about 53 minutes of downtime a year, run stateless servers across zones behind a load balancer.",
      "Popular links get clicked again and again; at 100 reads per write and a 50 ms target, a cache answers most redirects.",
    ],
  },
  {
    id: "order-checkout",
    title: "Online store checkout",
    brief:
      "Signed-in shoppers pay, stock is reserved and the order is recorded. Totals and stock counts must always be exact; confirmation emails can arrive a little later.",
    functional: ["Shoppers sign in.", "Place an order and pay for it.", "Send a confirmation email."],
    nonFunctional: [
      "Checkout is available 99.99% of the time.",
      "Stock counts and payments are never stale or double-counted; other data may lag.",
      "Payment and personal data are protected.",
    ],
    requirements: req({
      dataShape: "relational",
      userAccounts: true,
      asyncWork: true,
      peakRps: 400,
      readWriteRatio: 3,
      availability: 99.99,
      consistency: "mixed",
      sensitiveData: true,
    }),
    expected: {
      components: [
        "rate-limiter",
        "load-balancer",
        "auth-service",
        "app-servers",
        "relational-database",
        "database-replicas",
        "message-queue",
        "metrics-monitoring",
        "centralized-logging",
      ],
      shape: "modular-monolith",
      topology: "multi-zone",
      tensions: [],
    },
    walkthrough: [
      "Orders, line items, stock and payments reference each other and must change together: a relational database with transactions.",
      "Only stock and payment data need to be exact, so consistency is mixed rather than strong everywhere.",
      "At 99.99%, a standby database in another zone is ready to take over; rebuilding from backup would blow the downtime budget.",
      "Emails go through a queue, so a slow email provider never holds up a purchase.",
      "There's no cache: reads don't dominate, and a stale stock count would cause overselling.",
    ],
  },
  {
    id: "news-feed",
    title: "Social news feed",
    brief:
      "Users post text and photos and scroll a feed of posts from people they follow. Hundreds of millions of feed views a day, worldwide.",
    functional: ["Users sign in.", "Publish a post with photos.", "Scroll a feed of followed users' posts."],
    nonFunctional: [
      "Available 99.9% of the time.",
      "Feeds load within 200 ms at the 99th percentile.",
      "A new post may take a few seconds to reach followers.",
      "Peaks of 20,000 requests per second, about 50 reads per write.",
    ],
    requirements: req({
      dataShape: "document",
      userAccounts: true,
      mediaUploads: true,
      asyncWork: true,
      peakRps: 20000,
      readWriteRatio: 50,
      availability: 99.9,
      latencyMs: 200,
      consistency: "eventual",
      globalUsers: true,
    }),
    expected: {
      components: [
        "cdn",
        "rate-limiter",
        "load-balancer",
        "auth-service",
        "app-servers",
        "cache",
        "document-database",
        "database-replicas",
        "object-storage",
        "message-queue",
        "metrics-monitoring",
        "centralized-logging",
      ],
      shape: "modular-monolith",
      topology: "single-zone",
      tensions: [],
    },
    walkthrough: [
      "A post and its media references are read together, so each is a document.",
      "Publishing puts a job on a queue that fans the post out to followers' feeds, which is why a few seconds' delay is acceptable.",
      "At 50 reads per write, a cache holds ready-made feeds and replicas absorb the rest of the reads.",
      "Photos go straight to object storage and reach viewers worldwide through a CDN.",
    ],
  },
  {
    id: "global-store",
    title: "Global storefront",
    brief:
      "A store selling worldwide: shoppers search the catalog, view product photos and buy. Pages must feel fast everywhere, the last unit must never be sold twice, and the business wants daily sales reports.",
    functional: [
      "Shoppers sign in.",
      "Search the catalog by text.",
      "View product pages with photos.",
      "Buy items.",
      "Produce daily sales reports.",
    ],
    nonFunctional: [
      "Available 99.99% of the time.",
      "Pages respond within 100 ms at the 99th percentile for users everywhere.",
      "Stock counts are always exact; catalog data may lag briefly.",
      "Payment and personal data are protected.",
    ],
    requirements: req({
      dataShape: "relational",
      userAccounts: true,
      mediaUploads: true,
      fullTextSearch: true,
      reporting: true,
      peakRps: 5000,
      readWriteRatio: 20,
      availability: 99.99,
      latencyMs: 100,
      consistency: "mixed",
      globalUsers: true,
      sensitiveData: true,
    }),
    expected: {
      components: [
        "cdn",
        "rate-limiter",
        "load-balancer",
        "auth-service",
        "app-servers",
        "cache",
        "relational-database",
        "database-replicas",
        "search-index",
        "object-storage",
        "etl-pipeline",
        "data-warehouse",
        "metrics-monitoring",
        "centralized-logging",
      ],
      shape: "modular-monolith",
      topology: "multi-region",
      tensions: ["consistency-vs-availability", "latency-vs-consistency"],
    },
    walkthrough: [
      "Exact stock is a non-functional requirement: it says how correct the system must be, not what it does.",
      "Worldwide users at 99.99% call for several regions, but exact stock must be decided in one place, which is the tension to discuss.",
      "A common answer: give stock a home region and route purchases there, while catalog pages, search and photos are served locally from replicas, the cache and the CDN.",
      "Reports run in a warehouse fed nightly, so they never slow down shoppers.",
    ],
  },
  {
    id: "small-team-booking",
    title: "Booking app for a small team",
    brief:
      "Two engineers run a booking app for a group of dental clinics. Patients sign in to book and move appointments. Traffic is quiet most weeks and busy around flu season, and nobody on the team runs an on-call rotation.",
    functional: ["Patients sign in.", "Book and reschedule appointments."],
    nonFunctional: [
      "Available 99.9% of the time.",
      "Pages respond within 300 ms at the 99th percentile.",
      "About 200 requests per second at peak, about 4 reads per write.",
    ],
    requirements: req({
      dataShape: "relational",
      userAccounts: true,
      peakRps: 200,
      readWriteRatio: 4,
      availability: 99.9,
      latencyMs: 300,
      consistency: "eventual",
      independentTeams: 2,
      opsMaturity: "limited",
    }),
    expected: {
      components: [
        "app-servers",
        "auth-service",
        "centralized-logging",
        "load-balancer",
        "metrics-monitoring",
        "rate-limiter",
        "relational-database",
      ],
      shape: "modular-monolith",
      topology: "single-zone",
      tensions: [],
    },
    walkthrough: [
      "Patients, clinics and appointments reference each other, so a relational database fits.",
      "Two engineers and no on-call rotation mean one deployable: a modular monolith, with module boundaries kept for a later split.",
      "At 99.9%, two servers behind a load balancer keep the booking page up through a single server failure.",
      "Sign-in and its rate limit are the only extra components. Nothing is cached: at 4 reads per write and a 300 ms target, the database keeps up.",
    ],
  },
];
