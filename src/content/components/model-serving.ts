import type { Component } from "../types";

export const modelServing: Component = {
  id: "model-serving",
  name: "Model Serving",
  layer: "compute",
  oneLiner: "Runs a language model on your own GPUs and answers requests from your services.",
  howItWorks:
    "A serving engine loads the model weights onto GPUs and generates answers one token at a time. To keep the GPUs busy it batches many requests together, and it manages the memory each request needs for the text generated so far. Throughput depends heavily on how well that memory is managed.",
  addWhen: [
    "Data must not leave your own infrastructure, so a provider's API is ruled out.",
    "Traffic is high and steady enough that owning GPUs costs less than paying per token.",
    "You need a fine-tuned or open model that no provider hosts for you.",
  ],
  skipWhen: [
    "Traffic is low or uneven, so GPUs would sit idle most of the time.",
    "A provider's API meets your privacy and quality needs.",
  ],
  tradeoffs: [
    {
      cost: "GPUs are expensive and scarce, and you pay for them whether or not they are busy.",
      mitigation: "Measure throughput per GPU under real load, and scale on queue length rather than CPU.",
    },
    {
      cost: "You own upgrades, security patches and capacity planning that a provider would otherwise handle.",
      mitigation: "Keep a provider model available through the gateway as a fallback.",
    },
    {
      cost: "Batching more requests raises throughput but makes each one wait longer.",
      mitigation: "Set a latency target per route and tune batch size to stay under it.",
    },
  ],
  interviewAngle:
    "Expect questions on batching, GPU memory per request, how you scale when a GPU takes minutes to start, and the cost comparison with a provider's API.",
  tools: [
    { name: "vLLM", kind: "self-hosted" },
    { name: "NVIDIA Triton Inference Server", kind: "self-hosted" },
    { name: "Amazon SageMaker", kind: "managed" },
  ],
  related: ["model-gateway", "load-balancer"],
  glossary: ["token", "time-to-first-token"],
  sources: [
    {
      title: "Kwon et al., Efficient Memory Management for Large Language Model Serving with PagedAttention (2023)",
      url: "https://arxiv.org/abs/2309.06180",
    },
  ],
};
