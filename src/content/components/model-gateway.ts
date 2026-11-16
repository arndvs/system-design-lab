import type { Component } from "../types";

export const modelGateway: Component = {
  id: "model-gateway",
  name: "Model Gateway",
  layer: "compute",
  oneLiner: "One service that every call to a language model goes through, for keys, retries, fallback and cost tracking.",
  howItWorks:
    "Application code calls the gateway instead of a provider. The gateway holds the provider keys, retries failed calls, and falls back to another model or provider when one is down or rate-limited. Because every call passes through it, it can also enforce per-team limits and record tokens and cost for each caller.",
  addWhen: [
    "The product calls a language model and must keep working when one provider has an outage.",
    "Several teams or features share model access, and you need limits and cost per team.",
    "You want to switch or compare models without changing application code.",
  ],
  skipWhen: [
    "A single prototype calls one model and an outage costs little.",
  ],
  tradeoffs: [
    {
      cost: "Every model call takes an extra network hop, and the gateway becomes a dependency of every AI feature.",
      mitigation: "Run it next to the application servers, keep it stateless, and run more than one copy.",
    },
    {
      cost: "Falling back to a different model can change answers in ways users notice.",
      mitigation: "Run the evaluation set against every fallback model before allowing it in the route.",
    },
    {
      cost: "A failed call that looks successful, such as an empty answer, is not retried.",
      mitigation: "Check each response for a usable answer, and treat empty or truncated output as a failure.",
    },
  ],
  interviewAngle:
    "Be ready to discuss how you detect a failing provider, when to retry versus fall back, how streaming affects retries, and how you attribute cost to callers.",
  tools: [
    { name: "LiteLLM", kind: "self-hosted" },
    { name: "Cloudflare AI Gateway", kind: "managed" },
    { name: "OpenRouter", kind: "managed" },
  ],
  related: ["llm-evals", "rate-limiter", "model-serving"],
  glossary: ["token", "time-to-first-token"],
  sources: [
    { title: "LiteLLM docs: Fallbacks (provider failover)", url: "https://docs.litellm.ai/docs/proxy/reliability" },
  ],
};
