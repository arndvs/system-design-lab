import type { Source } from "./types";

export type ShapeId = "monolith" | "modular-monolith" | "microservices";

export type ShapeEntry = {
  id: ShapeId;
  name: string;
  /** One plain-language sentence. */
  oneLiner: string;
  /** Situations where this shape fits. */
  addWhen: string[];
  /** Situations where it is the wrong choice. */
  skipWhen: string[];
  /** Each cost is paired with the way teams usually contain it. */
  tradeoffs: { cost: string; mitigation: string }[];
  /** What an interviewer is likely to push on. */
  interviewAngle: string;
  /** At least one primary source. */
  sources: Source[];
};

const monolithFirst: Source = {
  title: 'Martin Fowler, "Monolith First" (2015)',
  url: "https://martinfowler.com/bliki/MonolithFirst.html",
};
const microservicePremium: Source = {
  title: 'Martin Fowler, "Microservice Premium" (2015)',
  url: "https://martinfowler.com/bliki/MicroservicePremium.html",
};
const monolithPattern: Source = {
  title: "Chris Richardson, microservices.io: Monolithic architecture pattern",
  url: "https://microservices.io/patterns/monolithic.html",
};

/** The three shapes the lab can describe. Only the two in the engine's result are recommended. */
export const shapeEntries: ShapeEntry[] = [
  {
    id: "monolith",
    name: "Monolith",
    oneLiner:
      "One deployable unit that holds the whole application: the cheapest shape to build and run while the product is still changing.",
    addWhen: [
      "A small team is still working out what the product should do, and most changes touch several areas at once.",
      "Nobody is available to run more than one deployable, so the operating budget covers a single application.",
    ],
    skipWhen: [
      "Several teams need to release on their own schedules; a shared build then becomes the bottleneck.",
      "Parts of the code change far more often than others, and the coupling already slows every release.",
    ],
    tradeoffs: [
      {
        cost: "Every change ships through one build, so an unrelated failure can block a release.",
        mitigation: "Keep the test suite fast and run it on every change, so failures surface before they reach a release.",
      },
      {
        cost: "The whole application scales together, so the busiest feature sets the capacity for everything.",
        mitigation: "Measure where time and memory go before adding capacity, then run more copies of the same build behind a load balancer.",
      },
    ],
    interviewAngle:
      "Explain why a monolith is often the right first shape, and name the signals that it has outgrown this shape: slow builds, blocked releases, and one team waiting on another.",
    sources: [monolithFirst, monolithPattern],
  },
  {
    id: "modular-monolith",
    name: "Modular monolith",
    oneLiner:
      "One deployable with enforced internal boundaries, so several teams can work in parallel without paying for a network between them.",
    addWhen: [
      "Several people change the product every week, and their work keeps colliding in the same code.",
      "Operations capacity is limited, but the code must stay separable for a later split.",
    ],
    skipWhen: [
      "A single small team can hold the whole system in view; boundaries would be ceremony with no owner.",
      "Modules must release on separate schedules, which one artifact cannot offer.",
    ],
    tradeoffs: [
      {
        cost: "Boundaries exist only in naming and folder layout until something enforces them, and direct reads into another module's tables creep in.",
        mitigation: "Expose each module through a narrow public interface, and fail the build when code reaches into another module's internals.",
      },
      {
        cost: "A crash or memory leak in one module takes down the whole process.",
        mitigation: "Keep critical paths small and isolated, and make health checks report the state of each module's dependencies.",
      },
    ],
    interviewAngle:
      "Be ready to say how you would enforce module boundaries in code, which module owns which data, and what evidence would show a module is ready to be extracted as a service.",
    sources: [monolithPattern, microservicePremium],
  },
  {
    id: "microservices",
    name: "Microservices",
    oneLiner:
      "Separately deployed services, each owning its data and scaled on its own, which pays off only when team and scaling needs are real.",
    addWhen: [
      "Several independent teams deploy on their own schedules and are held back by a shared release.",
      "Parts of the product need very different capacity, and paying for uniform scaling wastes money.",
      "Monitoring, automated deployment and on-call rotations already exist, so the operating cost is affordable.",
    ],
    skipWhen: [
      "Automated deployment, monitoring and tracing are missing; the operating cost arrives before any benefit.",
      "A couple of engineers own everything, and they would spend their time on the network instead of the product.",
    ],
    tradeoffs: [
      {
        cost: "Every call between services can fail, slow down or time out.",
        mitigation: "Set timeouts and bounded retries on every outbound call, and design each operation to tolerate partial failure.",
      },
      {
        cost: "Data is split across services, so a change that touches several of them is no longer one transaction.",
        mitigation: "Give each service sole ownership of its data, and coordinate multi-service changes through explicit workflows with compensating steps.",
      },
      {
        cost: "A single user request now spreads across many log streams.",
        mitigation: "Pass a correlation ID on every call and add distributed tracing before the first split, not after it.",
      },
    ],
    interviewAngle:
      "Expect questions on where to draw service boundaries, how data ownership works without distributed transactions, and what you would build for observability before the first split.",
    sources: [microservicePremium, monolithFirst],
  },
];
