import { components } from "../content/components";
import { scenarios, type Scenario } from "../content/scenarios";
import type { Layer, Topology } from "../content/types";
import { drills, type Attempt, type Grade } from "../engine/practice";
import { componentNames, OFF_PATH, REQUEST_PATH } from "./diagram";
import { esc } from "./html";
import { topologyLabel } from "./results";

const TOPOLOGIES = Object.keys(topologyLabel) as Topology[];

// Written out in full so Tailwind can see each class.
const checkedRing: Record<Layer, string> = {
  edge: "peer-checked:ring-layer-edge",
  entry: "peer-checked:ring-layer-entry",
  compute: "peer-checked:ring-layer-compute",
  data: "peer-checked:ring-layer-data",
  async: "peer-checked:ring-layer-async",
  analytics: "peer-checked:ring-layer-analytics",
  ops: "peer-checked:ring-layer-ops",
};

const list = (items: string[]) => `<ul class="mt-1 list-disc space-y-1 pl-5 text-sm">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

const reveal = (summary: string, body: string) => `
  <details class="rounded-lg border border-line bg-page">
    <summary class="cursor-pointer px-3 py-2 text-sm text-accent">${esc(summary)}</summary>
    <div class="border-t border-line px-3 py-3 text-muted">${body}</div>
  </details>`;

/** Every component as a pickable chip, grouped by layer in request-path order. */
function picker(): string {
  return [...REQUEST_PATH, ...OFF_PATH]
    .map((layer) => {
      const ids = Object.values(components)
        .filter((c) => c.layer === layer.id)
        .map((c) => c.id);
      return `
      <div class="grid grid-cols-[5.5rem_1fr] items-start gap-3">
        <p class="pt-1.5 text-xs font-medium ${layer.text}">${layer.label}</p>
        <div class="flex flex-wrap gap-2">${ids
          .map(
            (id) => `
          <label class="cursor-pointer">
            <input type="checkbox" name="pick" value="${esc(id)}" class="peer sr-only" />
            <span class="block rounded-lg border border-line px-2.5 py-1.5 text-sm text-muted peer-checked:border-transparent peer-checked:bg-raised peer-checked:text-ink peer-checked:ring-2 peer-checked:ring-inset ${checkedRing[layer.id]} peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">${esc(components[id]!.name)}</span>
          </label>`,
          )
          .join("")}</div>
      </div>`;
    })
    .join("");
}

function topologyPicker(): string {
  return `<div class="flex flex-wrap gap-2">${TOPOLOGIES.map(
    (t) => `
    <label class="cursor-pointer">
      <input type="radio" name="topology" value="${t}" class="peer sr-only" />
      <span class="block rounded-lg border border-line px-2.5 py-1.5 text-sm text-muted peer-checked:bg-raised peer-checked:text-ink peer-checked:ring-2 peer-checked:ring-inset peer-checked:ring-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">${topologyLabel[t]}</span>
    </label>`,
  ).join("")}</div>`;
}

export function renderPractice(root: HTMLElement, scenario: Scenario) {
  root.innerHTML = `
    <div class="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <nav aria-label="Scenarios" class="min-w-0">
        <ul class="flex gap-2 overflow-x-auto lg:flex-col">${scenarios
          .map(
            (s) => `
          <li><button type="button" data-scenario="${esc(s.id)}" ${s.id === scenario.id ? 'aria-current="true"' : ""}
            class="w-full rounded-lg border border-line px-3 py-2 text-left text-sm whitespace-nowrap text-muted aria-[current=true]:bg-raised aria-[current=true]:text-ink lg:whitespace-normal">${esc(s.title)}</button></li>`,
          )
          .join("")}</ul>
      </nav>

      <div class="min-w-0 space-y-4">
        <section class="rounded-xl border border-line bg-panel p-4">
          <p class="text-xs font-medium text-muted">The brief</p>
          <h2 class="mt-1 font-semibold">${esc(scenario.title)}</h2>
          <p class="mt-2 text-sm text-muted">${esc(scenario.brief)}</p>
        </section>

        <section class="rounded-xl border border-line bg-panel p-4">
          <p class="text-xs font-medium text-muted">Step 1</p>
          <h2 class="mt-1 font-semibold">Sort the brief into features and quality targets</h2>
          <p class="mt-1 mb-3 text-sm text-muted">Say them out loud or write them down, then check. Put a number on every quality target.</p>
          ${reveal(
            "Show the sorted requirements",
            `<p class="text-xs font-medium text-sky-300">What it does</p>${list(scenario.functional)}
             <p class="mt-3 text-xs font-medium text-amber-300">How well</p>${list(scenario.nonFunctional)}`,
          )}
        </section>

        <form data-attempt class="rounded-xl border border-line bg-panel p-4">
          <p class="text-xs font-medium text-muted">Step 2</p>
          <h2 class="mt-1 font-semibold">Pick the components</h2>
          <p class="mt-1 mb-4 text-sm text-muted">Choose only what this brief calls for. Leaving a part out is as much a decision as adding one.</p>
          <div class="space-y-3">${picker()}</div>
          <h3 class="mt-6 text-sm font-semibold">Where does it run?</h3>
          <div class="mt-2">${topologyPicker()}</div>
          <div class="mt-6 flex flex-wrap items-center gap-3">
            <button type="submit" class="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-zinc-950">Check my design</button>
            <button type="reset" class="rounded-md border border-line px-3 py-1.5 text-sm">Clear</button>
          </div>
        </form>

        <div data-result aria-live="polite" tabindex="-1" class="space-y-4 scroll-mt-6 empty:hidden"></div>
      </div>
    </div>`;
}

export function readAttempt(root: HTMLElement): Attempt {
  const picked = [...root.querySelectorAll<HTMLInputElement>('input[name="pick"]:checked')].map((i) => i.value);
  const topology = root.querySelector<HTMLInputElement>('input[name="topology"]:checked')?.value as Topology | undefined;
  return { components: picked, topology: topology ?? null };
}

function verdict(g: Grade): string {
  if (g.perfect) return "Exact match with the reference design.";
  const parts = [`You matched ${g.score.matched} of ${g.score.of} parts`];
  if (g.extra.length) parts.push(`added ${g.extra.length} the brief does not call for`);
  parts.push(g.topology.right ? "and placed it correctly" : "and the placement differs");
  return parts.join(", ") + ".";
}

export function renderGrade(root: HTMLElement, scenario: Scenario, g: Grade) {
  const name = (id: string) => esc(components[id]!.name);
  const out = root.querySelector<HTMLElement>("[data-result]")!;

  const missed = g.missed.length
    ? `<div>
        <p class="text-xs font-medium text-rose-300">Missed (${g.missed.length})</p>
        <ul class="mt-1 space-y-2 text-sm">${g.missed.map((m) => `<li><span class="font-medium">${name(m.id)}.</span> <span class="text-muted">${esc(m.reason)}</span></li>`).join("")}</ul>
      </div>`
    : "";
  const extra = g.extra.length
    ? `<div>
        <p class="text-xs font-medium text-amber-300">Not called for (${g.extra.length})</p>
        <ul class="mt-1 space-y-2 text-sm">${g.extra.map((x) => `<li><span class="font-medium">${name(x.id)}.</span> <span class="text-muted">Nothing in this brief needs it. It is usually skipped when: ${esc(x.skipWhen.replace(/\.$/, "").replace(/^./, (ch) => ch.toLowerCase()))}.</span></li>`).join("")}</ul>
      </div>`
    : "";
  const right = g.right.length
    ? `<div>
        <p class="text-xs font-medium text-emerald-300">Right (${g.right.length})</p>
        <p class="mt-1 text-sm text-muted">${esc(componentNames(g.right))}</p>
      </div>`
    : "";

  const placement = `
    <div>
      <p class="text-xs font-medium ${g.topology.right ? "text-emerald-300" : "text-rose-300"}">Where it runs</p>
      <p class="mt-1 text-sm">${
        g.topology.right
          ? `${topologyLabel[g.topology.expected]}, as you chose.`
          : `${topologyLabel[g.topology.expected]}${g.topology.picked ? `, not ${topologyLabel[g.topology.picked].toLowerCase()}` : ". You did not choose one"}.`
      } <span class="text-muted">${esc(g.topology.reason)}</span></p>
    </div>`;

  const cards = scenario.expected.components
    .map(
      (id) => `
      <li class="rounded-xl border border-line bg-panel p-4">
        <h3 class="font-semibold">${name(id)}</h3>
        <div class="mt-3 space-y-2">${drills(scenario, id)
          .map((d) => reveal(d.question, d.answer.length > 1 ? list(d.answer) : `<p class="text-sm">${esc(d.answer[0] ?? "")}</p>`))
          .join("")}</div>
      </li>`,
    )
    .join("");

  out.innerHTML = `
    <section class="rounded-xl border ${g.perfect ? "border-emerald-500/50" : "border-line"} bg-panel p-4">
      <p class="text-xs font-medium text-muted">Result</p>
      <h2 class="mt-1 font-semibold">${esc(verdict(g))}</h2>
      <div class="mt-4 space-y-4">${missed}${extra}${right}${placement}</div>
    </section>

    <section class="rounded-xl border border-line bg-panel p-4">
      <p class="text-xs font-medium text-muted">The reasoning</p>
      <ol class="mt-2 list-decimal space-y-2 pl-5 text-sm text-muted">${scenario.walkthrough.map((w) => `<li>${esc(w)}</li>`).join("")}</ol>
      <button type="button" data-open-build class="mt-4 rounded-md border border-line px-3 py-1.5 text-sm">Open this design in Build</button>
    </section>

    <section>
      <h2 class="font-semibold">Drill cards</h2>
      <p class="mt-1 mb-3 text-sm text-muted">Answer each question out loud before you open it.</p>
      <ul class="grid gap-3 md:grid-cols-2">${cards}</ul>
    </section>`;
  out.focus({ preventScroll: true });
  out.scrollIntoView({ block: "start", behavior: "smooth" });
}

export function clearGrade(root: HTMLElement) {
  root.querySelector<HTMLElement>("[data-result]")!.innerHTML = "";
}
