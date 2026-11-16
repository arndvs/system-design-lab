import { MULTI_SERVER_RPS } from "../content/rules";
import { storage, throughput, type Step } from "../engine/estimate";
import type { EstimateInputs } from "../state";
import { esc } from "./html";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: n >= 1000 ? 0 : n >= 10 ? 1 : 2 });

type Field = { name: keyof EstimateInputs | "readWriteRatio"; label: string; hint: string; suffix: string };

const throughputFields: Field[] = [
  { name: "dailyActiveUsers", label: "Daily active users", hint: "People who use it on a normal day", suffix: "users" },
  { name: "requestsPerUserPerDay", label: "Requests per user per day", hint: "Page loads and API calls, added up", suffix: "req" },
  { name: "peakFactor", label: "Peak factor", hint: "Busiest moment as a multiple of the daily average", suffix: "\u00d7" },
  { name: "readWriteRatio", label: "Reads per write", hint: "Shared with the Build view", suffix: ": 1" },
];

const storageFields: Field[] = [
  { name: "bytesPerRecord", label: "Bytes per record", hint: "One stored item: a row, a post, an event", suffix: "bytes" },
  { name: "newRecordsPerDay", label: "New records per day", hint: "How many of them you write daily", suffix: "rec" },
  { name: "retentionYears", label: "Kept for", hint: "How long before you delete or archive", suffix: "years" },
  { name: "copies", label: "Copies", hint: "3 means a primary and two replicas", suffix: "\u00d7" },
];

const field = (f: Field, value: number) => `
  <label class="block">
    <span class="text-sm">${f.label}</span>
    <span class="block text-xs text-muted">${f.hint}</span>
    <span class="mt-1 flex items-center gap-2">
      <input name="${f.name}" type="number" min="0" step="any" value="${value}" inputmode="decimal"
        class="w-full rounded-md border border-line bg-page px-3 py-1.5 font-mono text-sm" />
      <span class="w-10 shrink-0 text-xs text-muted">${f.suffix}</span>
    </span>
  </label>`;

const working = (steps: Step[]) => `
  <ol class="space-y-3">${steps
    .map(
      (s, n) => `
    <li class="grid grid-cols-[1.25rem_1fr] gap-x-2">
      <span class="font-mono text-xs text-faint">${n + 1}</span>
      <div>
        <p class="text-xs font-medium text-muted">${esc(s.label)}</p>
        <p class="font-mono text-sm text-muted">${esc(s.formula)}</p>
        <p class="font-mono text-sm">= <span class="font-semibold text-ink">${fmt(s.value)}</span> ${esc(s.unit)}</p>
      </div>
    </li>`,
    )
    .join("")}</ol>`;

/** What the peak figure means for the design, quoting the same threshold the rules use. */
export function peakVerdict(peakRps: number): string {
  return peakRps > MULTI_SERVER_RPS
    ? `Rounded up, the peak is ${fmt(peakRps)} req/s. That is above ${fmt(MULTI_SERVER_RPS)}, the point where the Build view plans for more than one application server.`
    : `Rounded up, the peak is ${fmt(peakRps)} req/s. That is at or below ${fmt(MULTI_SERVER_RPS)}, so the Build view will not add servers for traffic alone.`;
}

export function renderEstimate(root: HTMLElement, e: EstimateInputs, readWriteRatio: number) {
  root.innerHTML = `
    <div class="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="throughput-heading" class="rounded-xl border border-line bg-panel p-4">
        <h2 id="throughput-heading" class="font-semibold">Traffic</h2>
        <p class="mt-1 text-sm text-muted">From daily users to requests per second at the busiest moment.</p>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">${throughputFields
          .map((f) => field(f, f.name === "readWriteRatio" ? readWriteRatio : e[f.name]))
          .join("")}</div>
        <div data-out="throughput" class="mt-6 border-t border-line pt-4" aria-live="polite"></div>
      </section>
      <section aria-labelledby="storage-heading" class="rounded-xl border border-line bg-panel p-4">
        <h2 id="storage-heading" class="font-semibold">Storage</h2>
        <p class="mt-1 text-sm text-muted">From record size to total disk, in decimal units as cloud providers bill.</p>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">${storageFields.map((f) => field(f, e[f.name as keyof EstimateInputs])).join("")}</div>
        <div data-out="storage" class="mt-6 border-t border-line pt-4" aria-live="polite"></div>
      </section>
    </div>`;
  renderEstimateResults(root, e, readWriteRatio);
}

/** Redraws only the working, so typing never loses focus. Returns the peak for the Build view. */
export function renderEstimateResults(root: HTMLElement, e: EstimateInputs, readWriteRatio: number): number {
  const t = throughput({
    dailyActiveUsers: e.dailyActiveUsers,
    requestsPerUserPerDay: e.requestsPerUserPerDay,
    readWriteRatio,
    peakFactor: e.peakFactor,
  });
  const s = storage({
    bytesPerRecord: e.bytesPerRecord,
    newRecordsPerDay: e.newRecordsPerDay,
    retentionYears: e.retentionYears,
    copies: e.copies,
  });
  root.querySelector('[data-out="throughput"]')!.innerHTML = `
    ${working(t.steps)}
    <p class="mt-4 text-sm text-muted">${esc(peakVerdict(t.peakRps))}</p>
    <button type="button" data-use-peak="${t.peakRps}"
      class="mt-3 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-zinc-950">Use ${fmt(t.peakRps)} req/s in Build</button>`;
  root.querySelector('[data-out="storage"]')!.innerHTML = `
    ${working(s.steps)}
    <p class="mt-4 text-sm text-muted">About <span class="font-semibold text-ink">${fmt(s.totalTB)} TB</span> in total. Indexes, backups and logs come on top of this.</p>`;
  return t.peakRps;
}

/** Reads the inputs, keeping the previous value for any field left empty or not a positive number. */
export function readEstimate(
  root: HTMLElement,
  previous: EstimateInputs,
  previousRatio: number,
): { inputs: EstimateInputs; readWriteRatio: number } {
  const num = (name: string, fallback: number) => {
    const n = Number(root.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  const inputs = { ...previous };
  for (const key of Object.keys(previous) as (keyof EstimateInputs)[]) inputs[key] = num(key, previous[key]);
  return { inputs, readWriteRatio: num("readWriteRatio", previousRatio) };
}
