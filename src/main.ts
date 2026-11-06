import "./styles.css";
import { components } from "./content/components";
import type { Layer, Requirements } from "./content/types";
import { diff, recommend, type Recommendation } from "./engine/recommend";
import { fromHash, toHash } from "./state";

const form = document.querySelector<HTMLFormElement>("#requirements")!;
const results = document.querySelector<HTMLUListElement>("#results")!;
const changes = document.querySelector<HTMLOListElement>("#changes")!;
const summary = document.querySelector<HTMLParagraphElement>("#summary")!;

const layerText: Record<Layer, string> = {
  edge: "text-layer-edge",
  entry: "text-layer-entry",
  compute: "text-layer-compute",
  data: "text-layer-data",
  async: "text-layer-async",
  analytics: "text-layer-analytics",
  ops: "text-layer-ops",
};

const toggles: { key: keyof Requirements; label: string; hint: string }[] = [
  { key: "highAvailability", label: "High availability", hint: "Must survive a server failure" },
  { key: "strongConsistency", label: "Strong consistency", hint: "Readers never see stale data" },
  { key: "lowLatency", label: "Low latency", hint: "Tight response-time budget" },
  { key: "globalUsers", label: "Global users", hint: "Traffic from many continents" },
  { key: "mediaUploads", label: "Images or video", hint: "Large files served to users" },
  { key: "eventDriven", label: "Event-driven work", hint: "Follow-up work after a request" },
];

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

const group = (legend: string, body: string) => `
  <fieldset class="rounded-xl border border-line bg-panel p-4">
    <legend class="px-1 text-xs font-medium text-muted">${legend}</legend>
    <div class="space-y-4">${body}</div>
  </fieldset>`;

function renderForm(r: Requirements) {
  const numberField = (name: string, label: string, value: number, suffix: string) => `
    <label class="block">
      <span class="text-sm">${label}</span>
      <span class="mt-1 flex items-center gap-2">
        <input name="${name}" type="number" min="1" step="any" value="${value}"
          class="w-full rounded-md border border-line bg-page px-3 py-1.5 font-mono text-sm" />
        <span class="shrink-0 text-xs text-muted">${suffix}</span>
      </span>
    </label>`;

  const shape = (value: string, label: string, hint: string) => `
    <label class="flex cursor-pointer gap-3 rounded-md border border-line px-3 py-2 has-checked:border-accent has-checked:bg-raised">
      <input type="radio" name="dataShape" value="${value}" ${r.dataShape === value ? "checked" : ""} class="mt-1 accent-sky-400" />
      <span><span class="block text-sm">${label}</span><span class="block text-xs text-muted">${hint}</span></span>
    </label>`;

  const toggle = ({ key, label, hint }: (typeof toggles)[number]) => `
    <label class="flex cursor-pointer items-start justify-between gap-4">
      <span><span class="block text-sm">${label}</span><span class="block text-xs text-muted">${hint}</span></span>
      <input type="checkbox" role="switch" name="${key}" ${r[key] ? "checked" : ""}
        class="peer sr-only" />
      <span aria-hidden="true" class="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-zinc-700 transition-colors
        after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-zinc-300 after:transition-transform
        peer-checked:bg-sky-500 peer-checked:after:translate-x-4 peer-checked:after:bg-white
        peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"></span>
    </label>`;

  form.innerHTML =
    group("Scale", numberField("peakRps", "Peak traffic", r.peakRps, "req/s") +
      numberField("readWriteRatio", "Reads per write", r.readWriteRatio, ": 1")) +
    group("Data", shape("relational", "Relational", "Records reference each other; you query across them") +
      shape("key-value", "Key-value", "Almost every access is by one ID")) +
    group("Needs", toggles.map(toggle).join(""));
}

function readForm(): Requirements {
  const data = new FormData(form);
  const num = (k: string, fallback: number) => {
    const n = Number(data.get(k));
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  const r = fromHash("");
  r.peakRps = num("peakRps", current.peakRps);
  r.readWriteRatio = num("readWriteRatio", current.readWriteRatio);
  r.dataShape = data.get("dataShape") === "key-value" ? "key-value" : "relational";
  for (const { key } of toggles) (r as Record<string, unknown>)[key] = data.has(key);
  return r;
}

function renderResults(rec: Recommendation, previous: Recommendation | null) {
  const ids = Object.keys(rec);
  summary.textContent = `${ids.length} components`;

  const { added, removed } = previous ? diff(previous, rec) : { added: [], removed: [] };
  changes.innerHTML = [
    ...added.map((id) => `<li class="text-emerald-300">+ ${esc(components[id]!.name)}: ${esc(rec[id]![0]!)}</li>`),
    ...removed.map((id) => `<li class="text-muted">− ${esc(components[id]!.name)}: no longer needed</li>`),
  ].join("");

  results.innerHTML = ids
    .map((id) => {
      const c = components[id]!;
      const isNew = added.includes(id);
      return `
      <li class="rounded-xl border ${isNew ? "border-emerald-500/50" : "border-line"} bg-panel p-4">
        <p class="text-xs font-medium capitalize ${layerText[c.layer]}">${c.layer}</p>
        <h2 class="mt-1 font-semibold">${esc(c.name)}</h2>
        <p class="mt-1 text-sm text-muted">${esc(c.oneLiner)}</p>
        <h3 class="mt-3 text-xs font-medium text-muted">Why it's here</h3>
        <ul class="mt-1 space-y-1 text-sm">${rec[id]!.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
        <details class="mt-3 text-sm">
          <summary class="cursor-pointer text-accent">Trade-offs and when to skip it</summary>
          <ul class="mt-2 space-y-2">${c.tradeoffs
            .map((t) => `<li><span class="text-ink">${esc(t.cost)}</span><br /><span class="text-muted">Fix: ${esc(t.mitigation)}</span></li>`)
            .join("")}</ul>
          <p class="mt-3 text-xs font-medium text-muted">Skip it when</p>
          <ul class="mt-1 list-disc space-y-1 pl-5 text-muted">${c.skipWhen.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
          <p class="mt-3 flex flex-wrap gap-1.5">${c.tools
            .map((t) => `<span class="rounded bg-raised px-2 py-0.5 font-mono text-xs">${esc(t.name)}</span>`)
            .join("")}</p>
        </details>
      </li>`;
    })
    .join("");
}

let current = fromHash(location.hash);
let currentRec = recommend(current);
renderForm(current);
renderResults(currentRec, null);

form.addEventListener("input", () => {
  current = readForm();
  const next = recommend(current);
  renderResults(next, currentRec);
  currentRec = next;
  history.replaceState(null, "", `#${toHash(current)}`);
});
form.addEventListener("submit", (e) => e.preventDefault());
