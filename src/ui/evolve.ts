import { BASELINE } from "../content/rules";
import type { Topology } from "../content/types";
import type { Stage } from "../engine/evolve";
import { componentNames as names, layerDiagram } from "./diagram";
import { esc } from "./html";

export type EvolveEls = { summary: HTMLElement; root: HTMLElement };

export function renderEvolve(
  els: EvolveEls,
  stages: Stage[],
  index: number,
  topology: { level: Topology; reason: string },
) {
  const i = Math.min(Math.max(index, 0), stages.length - 1);
  const stage = stages[i]!;
  const last = i === stages.length - 1;
  els.summary.textContent = `Stage ${i + 1} of ${stages.length} \u00b7 ${stage.components.length} components`;

  const stepper = stages
    .map(
      (st, n) => `
      <li>
        <button type="button" data-stage="${n}" ${n === i ? 'aria-current="step"' : ""}
          class="rounded-md px-3 py-1.5 text-left text-sm whitespace-nowrap ${
            n === i ? "bg-raised text-ink" : n < i ? "text-muted hover:text-ink" : "text-faint hover:text-muted"
          }"><span class="font-mono text-xs">${n + 1}</span> ${esc(st.title)}</button>
      </li>`,
    )
    .join("");

  // Stage 0 starts from the baseline, which no rule adds, so say what it is.
  const baseline =
    i === 0
      ? `<p class="mt-3 text-sm text-muted">Already here, as in every design: ${esc(names(BASELINE.map((b) => b.id)))}.</p>`
      : "";

  const steps = stage.steps
    .map(
      (step) => `
      <li class="rounded-xl border border-line bg-panel p-4">
        <p class="text-xs font-medium text-rose-300">What hurts</p>
        <p class="mt-1 font-semibold">${esc(step.bottleneck)}</p>
        <p class="mt-3 text-xs font-medium text-emerald-300">What you add</p>
        <p class="mt-1 text-sm">${esc(names(step.added))}</p>
        <p class="mt-3 text-xs font-medium text-muted">Why</p>
        <p class="mt-1 text-sm text-muted">${esc(step.reason)}</p>
      </li>`,
    )
    .join("");

  els.root.innerHTML = `
    <nav aria-label="Stages" class="mb-4 overflow-x-auto rounded-xl border border-line bg-panel p-2">
      <ol class="flex gap-1">${stepper}</ol>
    </nav>

    <div class="mb-4 rounded-xl border border-line bg-panel p-4">
      <div class="mb-4 flex items-baseline justify-between gap-4">
        <h2 class="font-semibold">${esc(stage.title)}</h2>
        <p class="text-xs text-muted">${stage.added.length} new</p>
      </div>
      ${layerDiagram(stage.components, { fresh: stage.added })}
      ${baseline}
    </div>

    <ol class="grid gap-3 md:grid-cols-2">${steps}</ol>

    ${
      last
        ? `<div class="mt-4 rounded-xl border border-line bg-panel p-4">
            <p class="text-xs font-medium text-muted">Where it ends up running</p>
            <p class="mt-1 text-sm text-muted">${esc(topology.reason)}</p>
          </div>`
        : ""
    }

    <div class="mt-4 flex items-center justify-between gap-3">
      <button type="button" data-stage="${i - 1}" ${i === 0 ? "disabled" : ""}
        class="rounded-md border border-line px-3 py-1.5 text-sm disabled:opacity-40">Back</button>
      <p class="text-sm text-muted">${last ? "This is the full design for your requirements." : `Next: ${esc(stages[i + 1]!.title)}`}</p>
      <button type="button" data-stage="${i + 1}" ${last ? "disabled" : ""}
        class="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-zinc-950 disabled:opacity-40">Next</button>
    </div>`;
}
