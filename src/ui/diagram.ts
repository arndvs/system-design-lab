import { components } from "../content/components";
import type { Layer } from "../content/types";
import { esc } from "./html";

type LayerRow = { id: Layer; label: string; text: string; ring: string };

/** Layers a request passes through, in order. */
export const REQUEST_PATH: LayerRow[] = [
  { id: "edge", label: "Edge", text: "text-layer-edge", ring: "ring-layer-edge" },
  { id: "entry", label: "Entry", text: "text-layer-entry", ring: "ring-layer-entry" },
  { id: "compute", label: "Compute", text: "text-layer-compute", ring: "ring-layer-compute" },
  { id: "data", label: "Data", text: "text-layer-data", ring: "ring-layer-data" },
];

/** Layers that do their work beside the request, not in its path. */
export const OFF_PATH: LayerRow[] = [
  { id: "async", label: "Async", text: "text-layer-async", ring: "ring-layer-async" },
  { id: "analytics", label: "Analytics", text: "text-layer-analytics", ring: "ring-layer-analytics" },
  { id: "ops", label: "Operations", text: "text-layer-ops", ring: "ring-layer-ops" },
];

export const componentNames = (ids: string[]) => ids.map((id) => components[id]!.name).join(", ");

const arrow = `<p aria-hidden="true" class="grid grid-cols-[5.5rem_1fr] gap-3 text-faint"><span></span><span class="pl-3 leading-none">\u2193</span></p>`;

export type DiagramOptions = {
  /** Components to outline as new. */
  fresh?: Iterable<string>;
  /** Render each box as a button carrying `data-goto`, for jumping to its card. */
  interactive?: boolean;
};

/**
 * The design as rows of boxes by layer: the request path from the client down
 * to the data, then the layers that work beside it. Layers with nothing in
 * them are left out.
 */
export function layerDiagram(ids: string[], { fresh = [], interactive = false }: DiagramOptions = {}): string {
  const isFresh = new Set(fresh);
  const box = (id: string, layer: LayerRow) => {
    const name = esc(components[id]!.name);
    const cls = isFresh.has(id)
      ? `rounded-lg bg-raised px-2.5 py-1.5 text-sm font-medium ring-2 ring-inset ${layer.ring}`
      : "rounded-lg border border-line px-2.5 py-1.5 text-sm text-muted";
    const mark = isFresh.has(id) ? `<span class="sr-only"> (new)</span>` : "";
    return interactive
      ? `<li><button type="button" data-goto="${esc(id)}" class="${cls} hover:text-ink">${name}${mark}</button></li>`
      : `<li class="${cls}">${name}${mark}</li>`;
  };
  const row = (layer: LayerRow) => {
    const inLayer = ids.filter((id) => components[id]!.layer === layer.id);
    if (inLayer.length === 0) return "";
    return `
      <div class="grid grid-cols-[5.5rem_1fr] items-start gap-3">
        <p class="pt-1.5 text-xs font-medium ${layer.text}">${layer.label}</p>
        <ul class="flex flex-wrap gap-2">${inLayer.map((id) => box(id, layer)).join("")}</ul>
      </div>`;
  };

  const client = `
      <div class="grid grid-cols-[5.5rem_1fr] items-start gap-3">
        <p class="pt-1.5 text-xs font-medium text-muted">Client</p>
        <ul class="flex flex-wrap gap-2"><li class="rounded-lg border border-dashed border-line px-2.5 py-1.5 text-sm text-muted">Browser or app</li></ul>
      </div>`;
  const path = [client, ...REQUEST_PATH.map(row).filter(Boolean)].join(arrow);
  const beside = OFF_PATH.map(row).filter(Boolean).join("");

  return `
    <div role="group" aria-label="Design by layer: ${esc(componentNames(ids))}">
      <div class="space-y-1.5">${path}</div>
      ${
        beside
          ? `<p class="mt-4 mb-2 border-t border-line pt-3 text-xs text-muted">Beside the request path</p><div class="space-y-3">${beside}</div>`
          : ""
      }
    </div>`;
}
