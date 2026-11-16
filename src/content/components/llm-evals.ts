import type { Component } from "../types";

export const llmEvals: Component = {
  id: "llm-evals",
  name: "Evaluation Suite",
  layer: "ops",
  oneLiner: "A set of real inputs with known good answers, run after every prompt or model change to catch regressions.",
  howItWorks:
    "You collect inputs that represent real use, including edge cases, and define what a good answer is for each. Every change to a prompt, model or retrieval step runs the whole set and is graded: by exact or string match where possible, by code checks, or by another model following a written rubric. The score is compared with the last accepted version before the change ships.",
  addWhen: [
    "The product relies on a language model, whose output can't be checked with ordinary unit tests.",
    "You change prompts, models or retrieval and need to know whether answers got better or worse.",
    "You fall back between models and must know each one is good enough.",
  ],
  skipWhen: [
    "A one-off experiment that will never ship.",
  ],
  tradeoffs: [
    {
      cost: "A good set takes real work to collect and keep current with how people actually use the product.",
      mitigation: "Start small with real cases, and add every bad answer reported in production to the set.",
    },
    {
      cost: "A model grading another model can be wrong or inconsistent.",
      mitigation: "Prefer exact and code-based checks, give model graders a precise rubric, and spot-check their grades by hand.",
    },
    {
      cost: "Scores can rise on the set while real quality does not, once the set is overfit.",
      mitigation: "Keep a held-out set that is not used while tuning, and check it before release.",
    },
  ],
  interviewAngle:
    "Be ready to say how you would build the first set, how you grade open-ended answers, how you measure retrieval separately from generation, and what score blocks a release.",
  tools: [
    { name: "promptfoo", kind: "self-hosted" },
    { name: "OpenAI Evals", kind: "self-hosted" },
    { name: "Langfuse", kind: "managed" },
  ],
  related: ["model-gateway", "vector-store", "metrics-monitoring"],
  glossary: ["llm-as-judge", "golden-set"],
  sources: [
    {
      title: "Anthropic docs: Define success criteria and build evaluations",
      url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests",
    },
  ],
};
