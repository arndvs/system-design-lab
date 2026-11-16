import { components } from "../content/components";
import { failures } from "../content/failures";
import { glossary } from "../content/glossary";
import { shapeEntries } from "../content/shape-entries";
import type { Source } from "../content/types";
import { search, usage } from "../engine/learn";
import { OFF_PATH, REQUEST_PATH } from "./diagram";
import { esc, term } from "./html";

const list = (items: string[]) => `<ul class="mt-1 list-disc space-y-1 pl-5">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
const label = (text: string) => `<p class="mt-4 text-xs font-medium text-muted first:mt-0">${text}</p>`;

const tradeoffs = (items: { cost: string; mitigation: string }[]) =>
  `<ul class="mt-1 space-y-2">${items
    .map((t) => `<li><span class="text-ink">${esc(t.cost)}</span><br /><span>Fix: ${esc(t.mitigation)}</span></li>`)
    .join("")}</ul>`;

const sources = (items: Source[]) =>
  `<ul class="mt-1 space-y-1">${items
    .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" class="text-accent underline underline-offset-2">${esc(s.title)}</a></li>`)
    .join("")}</ul>`;

const pill = (attrs: string, text: string) =>
  `<button type="button" ${attrs} class="rounded-lg border border-line px-2.5 py-1 text-sm text-muted hover:text-ink">${esc(text)}</button>`;

function componentEntry(id: string, open: boolean): string {
  const c = components[id]!;
  const u = usage(id);
  const origin = [
    u.baseline ? `<p class="mt-1">In every design, whatever the requirements.</p>` : "",
    u.pains.length ? list(u.pains) : "",
  ].join("");
  return `
    <li>
      <details id="entry-${esc(id)}" data-entry="${esc(id)}" ${open ? "open" : ""} class="scroll-mt-6 rounded-xl border border-line bg-panel">
        <summary class="cursor-pointer px-4 py-3">
          <span class="font-semibold">${esc(c.name)}</span>
          <span class="mt-0.5 block text-sm text-muted">${esc(c.oneLiner)}</span>
        </summary>
        <div class="border-t border-line px-4 py-4 text-sm text-muted">
          ${label("How it works")}<p class="mt-1">${esc(c.howItWorks)}</p>
          ${label("What brings it into a design")}${origin}
          ${label("Add it when")}${list(c.addWhen)}
          ${label("Skip it when")}${list(c.skipWhen)}
          ${label("What it costs, and the usual fix")}${tradeoffs(c.tradeoffs)}
          ${label("If it fails")}<p class="mt-1 text-ink">${esc(failures[id]!.breaks)}</p><p class="mt-1">Usual fix: ${esc(failures[id]!.contain)}</p>${
            failures[id]!.helpedBy.length
              ? `<p class="mt-2">What limits the damage, if the design has it:</p><ul class="mt-1 space-y-1">${failures[id]!.helpedBy
                  .map((h) => `<li>${pill(`data-open-entry="${esc(h.id)}"`, components[h.id]!.name)} <span>${esc(h.how)}</span></li>`)
                  .join("")}</ul>`
              : ""
          }
          ${label("Interview angle")}<p class="mt-1">${esc(c.interviewAngle)}</p>
          ${label("Tools")}<p class="mt-1 flex flex-wrap gap-1.5">${c.tools
            .map((t) => `<span class="rounded bg-raised px-2 py-0.5 font-mono text-xs">${esc(t.name)} <span class="text-faint">${t.kind}</span></span>`)
            .join("")}</p>
          ${c.glossary.length ? `${label("Terms")}<p class="mt-1 flex flex-wrap gap-1.5">${c.glossary.map(term).join("")}</p>` : ""}
          ${
            c.related.length
              ? `${label("Related")}<p class="mt-1 flex flex-wrap gap-1.5">${c.related
                  .filter((r) => components[r])
                  .map((r) => pill(`data-open-entry="${esc(r)}"`, components[r]!.name))
                  .join("")}</p>`
              : ""
          }
          ${
            u.scenarios.length
              ? `${label("Practice it in")}<p class="mt-1 flex flex-wrap gap-1.5">${u.scenarios.map((s) => pill(`data-open-scenario="${esc(s.id)}"`, s.title)).join("")}</p>`
              : ""
          }
          ${label("Sources")}${sources(c.sources)}
        </div>
      </details>
    </li>`;
}

function shapeEntry(id: string): string {
  const s = shapeEntries.find((entry) => entry.id === id)!;
  return `
    <li>
      <details class="rounded-xl border border-line bg-panel">
        <summary class="cursor-pointer px-4 py-3">
          <span class="font-semibold">${esc(s.name)}</span>
          <span class="mt-0.5 block text-sm text-muted">${esc(s.oneLiner)}</span>
        </summary>
        <div class="border-t border-line px-4 py-4 text-sm text-muted">
          ${label("It fits when")}${list(s.addWhen)}
          ${label("It is the wrong choice when")}${list(s.skipWhen)}
          ${label("What it costs, and the usual fix")}${tradeoffs(s.tradeoffs)}
          ${label("Interview angle")}<p class="mt-1">${esc(s.interviewAngle)}</p>
          ${label("Sources")}${sources(s.sources)}
        </div>
      </details>
    </li>`;
}

export function renderLearn(root: HTMLElement, query: string, openEntry: string | null) {
  root.innerHTML = `
    <label class="mb-6 block max-w-xl">
      <span class="text-sm">Search components, shapes and terms</span>
      <input type="search" name="q" value="${esc(query)}" placeholder="cache, idempotency, Kafka" autocomplete="off"
        class="mt-1 w-full rounded-md border border-line bg-page px-3 py-2 text-sm" />
    </label>
    <div data-learn-results></div>`;
  renderLearnResults(root, query, openEntry);
}

/** Redraws only the results, so typing in the search box never loses focus. */
export function renderLearnResults(root: HTMLElement, query: string, openEntry: string | null) {
  const found = search(query);
  const inResults = new Set(found.components);

  const layers = [...REQUEST_PATH, ...OFF_PATH]
    .map((layer) => {
      const ids = Object.values(components)
        .filter((c) => c.layer === layer.id && inResults.has(c.id))
        .map((c) => c.id);
      if (ids.length === 0) return "";
      return `
        <div class="grid gap-3 lg:grid-cols-[7rem_1fr]">
          <h3 class="pt-3 text-xs font-medium ${layer.text}">${layer.label}</h3>
          <ul class="space-y-2">${ids.map((id) => componentEntry(id, id === openEntry)).join("")}</ul>
        </div>`;
    })
    .join("");

  const empty = found.components.length + found.shapes.length + found.terms.length === 0;

  root.querySelector<HTMLElement>("[data-learn-results]")!.innerHTML = empty
    ? `<p class="text-sm text-muted">Nothing matches "${esc(query)}". Try a component name, a tool or a term.</p>`
    : `
    ${
      layers
        ? `<section aria-labelledby="learn-components" class="mb-10">
            <h2 id="learn-components" class="mb-3 font-semibold">Components <span class="text-sm font-normal text-muted">${found.components.length}</span></h2>
            <div class="space-y-4">${layers}</div>
          </section>`
        : ""
    }
    ${
      found.shapes.length
        ? `<section aria-labelledby="learn-shapes" class="mb-10">
            <h2 id="learn-shapes" class="font-semibold">Application shapes <span class="text-sm font-normal text-muted">${found.shapes.length}</span></h2>
            <p class="mt-1 mb-3 text-sm text-muted">How the code is packaged and deployed. Build recommends a modular monolith or microservices; the classic monolith is here for comparison.</p>
            <ul class="grid gap-2 lg:grid-cols-3 lg:items-start">${found.shapes.map(shapeEntry).join("")}</ul>
          </section>`
        : ""
    }
    ${
      found.terms.length
        ? `<section aria-labelledby="learn-glossary">
            <h2 id="learn-glossary" class="mb-3 font-semibold">Glossary <span class="text-sm font-normal text-muted">${found.terms.length}</span></h2>
            <dl class="grid gap-x-8 gap-y-4 md:grid-cols-2">${found.terms
              .map((key) => `<div><dt class="text-sm font-medium">${esc(glossary[key]!.term)}</dt><dd class="mt-0.5 text-sm text-muted">${esc(glossary[key]!.definition)}</dd></div>`)
              .join("")}</dl>
          </section>`
        : ""
    }`;
}

/** Opens one component's entry and brings it into view. */
export function revealEntry(root: HTMLElement, id: string) {
  const entry = root.querySelector<HTMLDetailsElement>(`#entry-${CSS.escape(id)}`);
  if (!entry) return;
  entry.open = true;
  entry.scrollIntoView({ block: "start", behavior: "smooth" });
  entry.querySelector<HTMLElement>("summary")?.focus({ preventScroll: true });
}
