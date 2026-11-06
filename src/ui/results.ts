import { components } from "../content/components";
import type { Driver, Layer, Topology } from "../content/types";
import { diff, type Recommendation } from "../engine/recommend";
import { esc, term } from "./html";

const layerText: Record<Layer, string> = {
  edge: "text-layer-edge",
  entry: "text-layer-entry",
  compute: "text-layer-compute",
  data: "text-layer-data",
  async: "text-layer-async",
  analytics: "text-layer-analytics",
  ops: "text-layer-ops",
};

const driverLabel: Record<Driver, string> = {
  functional: "What it does",
  "non-functional": "How well",
  baseline: "Baseline",
};

const driverStyle: Record<Driver, string> = {
  functional: "bg-sky-500/10 text-sky-300 ring-sky-500/30",
  "non-functional": "bg-amber-500/10 text-amber-300 ring-amber-500/30",
  baseline: "bg-zinc-500/10 text-zinc-300 ring-zinc-500/30",
};

const topologyLabel: Record<Topology, string> = {
  "single-server": "Single server",
  "single-zone": "One zone, redundant servers",
  "multi-zone": "Several zones",
  "multi-region": "Several regions",
};

const chip = (driver: Driver) =>
  `<span class="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${driverStyle[driver]}">${driverLabel[driver]}</span>`;

export type ResultsEls = {
  summary: HTMLElement;
  shape: HTMLElement;
  topology: HTMLElement;
  tensions: HTMLElement;
  changes: HTMLElement;
  list: HTMLElement;
};

export function renderResults(els: ResultsEls, rec: Recommendation, previous: Recommendation | null) {
  const ids = Object.keys(rec.components);
  els.summary.textContent = `${ids.length} components · ${topologyLabel[rec.topology.level].toLowerCase()}`;

  const shapeLabel = { "modular-monolith": "Modular monolith", microservices: "Microservices" }[rec.shape.level];
  els.shape.innerHTML = `
    <p class="text-xs font-medium text-muted">Application shape</p>
    <p class="mt-1 font-semibold">${shapeLabel}</p>
    <p class="mt-1 text-sm text-muted">${esc(rec.shape.reason)}</p>`;

  els.topology.innerHTML = `
    <p class="text-xs font-medium text-muted">Where it runs</p>
    <p class="mt-1 font-semibold">${topologyLabel[rec.topology.level]}</p>
    <p class="mt-1 text-sm text-muted">${esc(rec.topology.reason)}</p>`;

  els.tensions.innerHTML = rec.tensions.length
    ? `<h2 class="text-sm font-semibold text-amber-300">Trade-offs to decide (${rec.tensions.length})</h2>` +
      rec.tensions
        .map(
          (t) => `
        <div class="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <h3 class="font-semibold">${esc(t.title)}</h3>
          <p class="mt-1 text-sm text-muted">${esc(t.explain)}</p>
          <p class="mt-3 text-xs font-medium text-muted">Common ways to resolve it</p>
          <ul class="mt-1 list-disc space-y-1 pl-5 text-sm">${t.options.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>
          <p class="mt-3 flex flex-wrap gap-1.5">${t.concepts.map(term).join("")}</p>
        </div>`,
        )
        .join("")
    : "";

  const { added, removed } = previous ? diff(previous, rec) : { added: [], removed: [] };
  els.changes.innerHTML = [
    ...added.map((id) => `<li class="text-emerald-300">+ ${esc(components[id]!.name)}: ${esc(rec.components[id]![0]!.text)}</li>`),
    ...removed.map((id) => `<li class="text-muted">− ${esc(components[id]!.name)}: no longer needed</li>`),
  ].join("");

  els.list.innerHTML = ids
    .map((id) => {
      const c = components[id]!;
      const isNew = added.includes(id);
      return `
      <li class="rounded-xl border ${isNew ? "border-emerald-500/50" : "border-line"} bg-panel p-4">
        <p class="text-xs font-medium capitalize ${layerText[c.layer]}">${c.layer}</p>
        <h3 class="mt-1 font-semibold">${esc(c.name)}</h3>
        <p class="mt-1 text-sm text-muted">${esc(c.oneLiner)}</p>
        <p class="mt-3 text-xs font-medium text-muted">Why it's here</p>
        <ul class="mt-1 space-y-2 text-sm">${rec.components[id]!
          .map((r) => `<li class="flex items-start gap-2">${chip(r.driver)}<span>${esc(r.text)}</span></li>`)
          .join("")}</ul>
        <details class="mt-3 text-sm">
          <summary class="cursor-pointer text-accent">Trade-offs and when to skip it</summary>
          <ul class="mt-2 space-y-2">${c.tradeoffs
            .map((t) => `<li><span class="text-ink">${esc(t.cost)}</span><br /><span class="text-muted">Fix: ${esc(t.mitigation)}</span></li>`)
            .join("")}</ul>
          <p class="mt-3 text-xs font-medium text-muted">Skip it when</p>
          <ul class="mt-1 list-disc space-y-1 pl-5 text-muted">${c.skipWhen.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
          <p class="mt-3 text-xs font-medium text-muted">Interview angle</p>
          <p class="mt-1 text-muted">${esc(c.interviewAngle)}</p>
          <p class="mt-3 flex flex-wrap gap-1.5">${c.glossary.map(term).join("")}</p>
          <p class="mt-3 flex flex-wrap gap-1.5">${c.tools
            .map((t) => `<span class="rounded bg-raised px-2 py-0.5 font-mono text-xs">${esc(t.name)}</span>`)
            .join("")}</p>
          <p class="mt-3 text-xs text-muted">Sources: ${c.sources
            .map((s) => `<a class="text-accent underline-offset-2 hover:underline" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`)
            .join(" · ")}</p>
        </details>
      </li>`;
    })
    .join("");
}
