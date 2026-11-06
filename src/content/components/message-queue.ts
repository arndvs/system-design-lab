import type { Component } from "../types";

export const messageQueue: Component = {
  id: "message-queue",
  name: "Message Queue",
  layer: "async",
  oneLiner: "Holds work items between the service that creates them and the workers that process them, so neither has to wait for the other.",
  howItWorks:
    "Producers append messages and get an acknowledgement right away. Consumers pull messages at their own pace and confirm each one once it is handled; unconfirmed messages are redelivered, so a crashed worker does not lose work. A burst of incoming work simply makes the queue longer instead of overloading downstream systems.",
  addWhen: [
    "A request triggers slow follow-up work, such as sending email or resizing images, that the user shouldn't wait for.",
    "Write traffic arrives in spikes that the database or a downstream service can't absorb directly.",
    "Several services need to react to the same event without calling each other directly.",
  ],
  skipWhen: [
    "The caller needs the result immediately to build its response.",
    "Volume is low and a simple background job in the same process would do.",
  ],
  tradeoffs: [
    {
      cost: "Most queues deliver at least once, so the same message can be processed twice.",
      mitigation: "Make handlers idempotent, for example by recording processed message IDs.",
    },
    {
      cost: "A malformed message can fail forever and block or slow the queue.",
      mitigation: "Retry a limited number of times with backoff, then move the message to a dead-letter queue and alert.",
    },
    {
      cost: "Work completes later than the request, which complicates both the user experience and debugging.",
      mitigation: "Show users a pending state, and carry a correlation ID through every message.",
    },
  ],
  interviewAngle:
    "Expect to discuss delivery guarantees, ordering, idempotency, back-pressure, and when you would choose a log-based system like Kafka over a classic queue.",
  tools: [
    { name: "Amazon SQS", kind: "managed" },
    { name: "Google Cloud Pub/Sub", kind: "managed" },
    { name: "RabbitMQ", kind: "self-hosted" },
    { name: "Apache Kafka", kind: "self-hosted" },
  ],
  related: ["relational-database", "metrics-monitoring"],
  glossary: ["idempotent", "at-least-once", "dead-letter-queue", "back-pressure"],
  sources: [
    {
      title: "Microsoft Azure Architecture Center: Queue-Based Load Leveling pattern",
      url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling",
    },
    { title: "RabbitMQ documentation: Reliability guide", url: "https://www.rabbitmq.com/docs/reliability" },
  ],
};
