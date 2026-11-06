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

export type DataShape = "relational" | "key-value";

export type Requirements = {
  /** Expected peak requests per second. */
  peakRps: number;
  /** Reads per write, e.g. 10 means 10:1. */
  readWriteRatio: number;
  dataShape: DataShape;
  strongConsistency: boolean;
  highAvailability: boolean;
  globalUsers: boolean;
  lowLatency: boolean;
  eventDriven: boolean;
  mediaUploads: boolean;
};

export type Rule = {
  id: string;
  when: (r: Requirements) => boolean;
  add: string[];
  reason: string | ((r: Requirements) => string);
  /** Ordering for the evolution slider: lower stages happen first. */
  stage: number;
  /** The pain that forces this step, shown on the evolution slider. */
  bottleneck: string;
};
