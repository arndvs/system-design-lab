import { downtimeLabel } from "../content/availability";
import { shape } from "../content/shape";
import { AVAILABILITY_TARGETS, type Availability, type Consistency, type DataShape, type Requirements } from "../content/types";

type BoolKey = { [K in keyof Requirements]: Requirements[K] extends boolean ? K : never }[keyof Requirements];

const functionalSwitches: { key: BoolKey; label: string; hint: string }[] = [
  { key: "userAccounts", label: "User accounts", hint: "People sign up and sign in" },
  { key: "mediaUploads", label: "Images or video", hint: "Users upload and view media" },
  { key: "fullTextSearch", label: "Text search", hint: "Users search by keywords" },
  { key: "asyncWork", label: "Background work", hint: "Emails, fan-out, processing after the response" },
  { key: "realtimeAnalytics", label: "Live analytics", hint: "Counts or alerts within seconds of events" },
  { key: "reporting", label: "Reports over history", hint: "Business reporting across months of data" },
];

const nonFunctionalSwitches: { key: BoolKey; label: string; hint: string }[] = [
  { key: "globalUsers", label: "Worldwide users", hint: "Traffic from several continents" },
  { key: "sensitiveData", label: "Payments or personal data", hint: "Must be protected and audited" },
];

const shapes: { value: DataShape; label: string; hint: string }[] = [
  { value: "relational", label: "Relational", hint: "Linked records, queried across" },
  { value: "key-value", label: "Key-value", hint: "Nearly all access by one ID" },
  { value: "document", label: "Document", hint: "Nested records read whole" },
  { value: "graph", label: "Graph", hint: "Questions follow connections" },
];

const consistencies: { value: Consistency; label: string }[] = [
  { value: "eventual", label: "Eventual" },
  { value: "mixed", label: "Mixed" },
  { value: "strong", label: "Strong" },
];

const consistencyHint: Record<Consistency, string> = {
  eventual: "All data may be briefly stale after a write.",
  mixed: "Some data, like balances or stock, must always be exact; the rest may lag.",
  strong: "Every read must see the latest write.",
};

const group = (legend: string, sub: string, body: string) => `
  <fieldset class="rounded-xl border border-line bg-panel p-4">
    <legend class="px-1 text-sm font-semibold">${legend}</legend>
    <p class="-mt-1 mb-4 text-xs text-muted">${sub}</p>
    <div class="space-y-4">${body}</div>
  </fieldset>`;

const subhead = (text: string) => `<p class="text-xs font-medium text-muted">${text}</p>`;

const numberField = (name: keyof Requirements, label: string, value: number, suffix: string) => `
  <label class="block">
    <span class="text-sm">${label}</span>
    <span class="mt-1 flex items-center gap-2">
      <input name="${name}" type="number" min="1" step="any" value="${value}"
        class="w-full rounded-md border border-line bg-page px-3 py-1.5 font-mono text-sm" />
      <span class="w-10 shrink-0 text-xs text-muted">${suffix}</span>
    </span>
  </label>`;

const toggle = (r: Requirements, { key, label, hint }: { key: BoolKey; label: string; hint: string }) => `
  <label class="flex cursor-pointer items-start justify-between gap-4">
    <span><span class="block text-sm">${label}</span><span class="block text-xs text-muted">${hint}</span></span>
    <input type="checkbox" role="switch" name="${key}" ${r[key] ? "checked" : ""} class="peer sr-only" />
    <span aria-hidden="true" class="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-zinc-700 transition-colors
      after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-zinc-300 after:transition-transform
      peer-checked:bg-sky-500 peer-checked:after:translate-x-4 peer-checked:after:bg-white
      peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"></span>
  </label>`;

/** A row of radio buttons styled as one segmented control. */
const segmented = (name: string, label: string, options: { value: string; label: string }[], current: string) => `
  <div role="radiogroup" aria-label="${label}">
    <span class="text-sm">${label}</span>
    <div class="mt-1 grid rounded-md border border-line bg-page p-0.5" style="grid-template-columns: repeat(${options.length}, 1fr)">
      ${options
        .map(
          (o) => `
        <label class="cursor-pointer rounded px-1 py-1 text-center font-mono text-xs text-muted has-checked:bg-raised has-checked:text-ink
          has-focus-visible:outline-2 has-focus-visible:outline-accent">
          <input type="radio" name="${name}" value="${o.value}" ${o.value === current ? "checked" : ""} class="sr-only" />${o.label}
        </label>`,
        )
        .join("")}
    </div>
  </div>`;

export function renderRequirements(form: HTMLFormElement, r: Requirements) {
  const shapeCards = shapes
    .map(
      (s) => `
      <label class="cursor-pointer rounded-md border border-line px-3 py-2 has-checked:border-accent has-checked:bg-raised
        has-focus-visible:outline-2 has-focus-visible:outline-accent">
        <input type="radio" name="dataShape" value="${s.value}" ${r.dataShape === s.value ? "checked" : ""} class="sr-only" />
        <span class="block text-sm">${s.label}</span><span class="block text-xs text-muted">${s.hint}</span>
      </label>`,
    )
    .join("");

  form.innerHTML =
    group(
      "What it does",
      "Functional requirements decide which components you need.",
      subhead("Main data") +
        `<div class="grid grid-cols-2 gap-2">${shapeCards}</div>` +
        subhead("Features") +
        functionalSwitches.map((s) => toggle(r, s)).join(""),
    ) +
    group(
      "Team and operations",
      "These decide the application shape: one deployable, or separately deployed services.",
      numberField("independentTeams", "Independent teams", r.independentTeams, "teams") +
        toggle(r, { key: "unevenScaling", label: "Uneven scaling", hint: "Some parts need far more capacity than others" }) +
        segmented(
          "opsMaturity",
          "Operations maturity",
          [
            { value: "limited", label: "Limited" },
            { value: "solid", label: "Solid" },
          ],
          r.opsMaturity,
        ) +
        `<div data-show="services" class="${shape(r).level === "microservices" ? "" : "hidden"}">${numberField("serviceCount", "Services", r.serviceCount, "services")}</div>`,
    ) +
    group(
      "How well",
      "Non-functional requirements, as measurable targets, decide how they're arranged.",
      segmented(
        "availability",
        "Availability",
        AVAILABILITY_TARGETS.map((a) => ({ value: String(a), label: `${a}%` })),
        String(r.availability),
      ) +
        `<p class="-mt-2 text-xs text-muted">Allows <span data-downtime class="text-ink">${downtimeLabel(r.availability)}</span> of downtime a year.</p>` +
        numberField("latencyMs", "Response time, p99", r.latencyMs, "ms") +
        segmented("consistency", "Consistency", consistencies, r.consistency) +
        `<p data-consistency-hint class="-mt-2 text-xs text-muted">${consistencyHint[r.consistency]}</p>` +
        numberField("peakRps", "Peak traffic", r.peakRps, "req/s") +
        numberField("readWriteRatio", "Reads per write", r.readWriteRatio, ": 1") +
        nonFunctionalSwitches.map((s) => toggle(r, s)).join(""),
    );
}

/** Reads the form, keeping the previous value for any number field left empty or invalid. */
export function readRequirements(form: HTMLFormElement, previous: Requirements): Requirements {
  const data = new FormData(form);
  const num = (k: keyof Requirements) => {
    const n = Number(data.get(k));
    return Number.isFinite(n) && n > 0 ? n : (previous[k] as number);
  };
  const r: Requirements = {
    ...previous,
    dataShape: (data.get("dataShape") as DataShape) ?? previous.dataShape,
    consistency: (data.get("consistency") as Consistency) ?? previous.consistency,
    availability: Number(data.get("availability")) as Availability,
    independentTeams: Math.max(1, Math.round(num("independentTeams"))),
    unevenScaling: data.has("unevenScaling"),
    opsMaturity: data.get("opsMaturity") === "solid" ? "solid" : "limited",
    serviceCount: Math.round(num("serviceCount")),
    peakRps: num("peakRps"),
    readWriteRatio: num("readWriteRatio"),
    latencyMs: num("latencyMs"),
  };
  for (const { key } of [...functionalSwitches, ...nonFunctionalSwitches]) {
    r[key] = data.has(key);
  }

  // Keep the dependent bits of the form in step without re-rendering it (which would steal focus).
  form.querySelector('[data-show="services"]')?.classList.toggle("hidden", shape(r).level !== "microservices");
  form.querySelector("[data-downtime]")!.textContent = downtimeLabel(r.availability);
  form.querySelector("[data-consistency-hint]")!.textContent = consistencyHint[r.consistency];
  return r;
}
