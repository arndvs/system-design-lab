export type Layer = "edge" | "entry" | "compute" | "data" | "async" | "analytics" | "ops";

export type Source = { title: string; url: string };

export type Component = {
  id: string;
  name: string;
  layer: Layer;
  /** One plain-language sentence. */
  oneLiner: string;
  /** Two or three sentences on the mechanism. */
  howItWorks: string;
  /** Symptoms or requirements that call for it. */
  addWhen: string[];
  /** Situations where it is overkill. */
  skipWhen: string[];
  /** Each cost is paired with the way teams usually contain it. */
  tradeoffs: { cost: string; mitigation: string }[];
  /** What an interviewer is likely to push on. */
  interviewAngle: string;
  tools: { name: string; kind: "managed" | "self-hosted" }[];
  related: string[];
  /** Keys into the glossary. */
  glossary: string[];
  /** At least one primary source: official docs, a paper, or a standard. */
  sources: Source[];
};

// ---------------------------------------------------------------------------
// Requirements
//
// Split the way requirements are gathered in practice:
//   - Functional: what the system does. These decide WHICH components exist.
//   - Non-functional: how well it must do it, as measurable targets. These
//     decide HOW the components are arranged and replicated.
// ---------------------------------------------------------------------------

export type DataShape = "relational" | "key-value" | "document" | "graph";

/** Availability targets, as a percentage of time the service is up. */
export const AVAILABILITY_TARGETS = [99, 99.9, 99.99, 99.999] as const;
export type Availability = (typeof AVAILABILITY_TARGETS)[number];

/**
 * - eventual: every kind of data may be briefly stale.
 * - mixed: some data (balances, stock counts) must never be stale; the rest may be.
 * - strong: every read must see the latest write.
 */
export type Consistency = "eventual" | "mixed" | "strong";

export type Requirements = {
  // Functional: what it does
  dataShape: DataShape;
  userAccounts: boolean;
  mediaUploads: boolean;
  fullTextSearch: boolean;
  asyncWork: boolean;
  realtimeAnalytics: boolean;
  reporting: boolean;
  /** Only meaningful when the application shape is microservices. */
  serviceCount: number;
  /** Teams that deploy on their own schedule. Decides application shape. */
  independentTeams: number;
  /** Some parts of the product need far more capacity than others. */
  unevenScaling: boolean;
  /** Whether the team can run separately deployed services: monitoring, on-call, deploys. */
  opsMaturity: "limited" | "solid";

  // Non-functional: how well
  /** Expected peak requests per second. */
  peakRps: number;
  /** Reads per write, e.g. 10 means 10:1. */
  readWriteRatio: number;
  availability: Availability;
  /** 99th-percentile response-time target in milliseconds. */
  latencyMs: number;
  consistency: Consistency;
  globalUsers: boolean;
  sensitiveData: boolean;
};

/** Which side of the requirements pulled something in. */
export type Driver = "functional" | "non-functional" | "baseline";

export type Reason = { text: string; driver: Driver };

export type Rule = {
  id: string;
  driver: Driver;
  when: (r: Requirements) => boolean;
  add: string[] | ((r: Requirements) => string[]);
  reason: string | ((r: Requirements) => string);
  /** Ordering for the evolution slider: lower stages happen first. */
  stage: number;
  /** The pain that forces this step, shown on the evolution slider. */
  bottleneck: string;
};

export type Topology = "single-server" | "single-zone" | "multi-zone" | "multi-region";

/** Two requirements pulling against each other. */
export type Tension = {
  id: string;
  when: (r: Requirements) => boolean;
  title: string;
  explain: string | ((r: Requirements) => string);
  /** What a designer usually does about it. */
  options: string[];
  /** Glossary keys for the concepts involved. */
  concepts: string[];
};
