import "./styles.css";
import { scenarios } from "./content/scenarios";
import { evolve } from "./engine/evolve";
import { grade } from "./engine/practice";
import { recommend } from "./engine/recommend";
import { estimateFromHash, estimateToParams, fromHash, toHash } from "./state";
import { readEstimate, renderEstimate, renderEstimateResults } from "./ui/estimate";
import { renderEvolve, type EvolveEls } from "./ui/evolve";
import { clearGrade, readAttempt, renderGrade, renderPractice } from "./ui/practice";
import { readRequirements, renderRequirements } from "./ui/requirements";
import { renderResults, type ResultsEls } from "./ui/results";

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;

const VIEWS = ["build", "evolve", "estimate", "practice"] as const;
type View = (typeof VIEWS)[number];
const asView = (v: string | null | undefined): View => VIEWS.find((name) => name === v) ?? "build";

const form = $<HTMLFormElement>("#requirements");
const els: ResultsEls = {
  summary: $("#summary"),
  shape: $("#shape"),
  topology: $("#topology"),
  diagram: $("#diagram"),
  tensions: $("#tensions"),
  changes: $("#changes"),
  list: $("#results"),
};
const evolveEls: EvolveEls = { summary: $("#evolve-summary"), root: $("#evolve") };
const estimateRoot = $("#estimate");
const practiceRoot = $("#practice");
const sections: Record<View, HTMLElement> = {
  build: $("#view-build"),
  evolve: $("#view-evolve"),
  estimate: $("#view-estimate"),
  practice: $("#view-practice"),
};
const tabs = [...document.querySelectorAll<HTMLButtonElement>("[data-view]")];

// The view, the stage and the estimate inputs ride in the hash beside the
// requirements, so a link opens on the same screen. They are not requirements,
// so fromHash ignores them.
const params = new URLSearchParams(location.hash.replace(/^#/, ""));
let view = asView(params.get("view"));
let stageIndex = Math.max(0, Number(params.get("stage") ?? 1) - 1) || 0;
let estimate = estimateFromHash(location.hash);
let scenario = scenarios.find((s) => s.id === params.get("scenario")) ?? scenarios[0]!;

let current = fromHash(location.hash);
let currentRec = recommend(current);
let stages = evolve(current);

function writeHash() {
  const p = new URLSearchParams(toHash(current));
  if (view !== "build") p.set("view", view);
  if (view === "evolve" && stageIndex > 0) p.set("stage", String(stageIndex + 1));
  if (view === "practice" && scenario !== scenarios[0]) p.set("scenario", scenario.id);
  for (const [key, value] of estimateToParams(estimate)) p.set(key, value);
  history.replaceState(null, "", `#${p.toString()}`);
}

function showEvolve() {
  stageIndex = Math.min(stageIndex, stages.length - 1);
  renderEvolve(evolveEls, stages, stageIndex, currentRec.topology);
}

function showView() {
  for (const [name, el] of Object.entries(sections)) el.hidden = name !== view;
  // Estimate and Practice have their own inputs and use the full width.
  form.hidden = view === "estimate" || view === "practice";
  for (const tab of tabs) {
    if (tab.dataset.view === view) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  }
  if (view === "evolve") showEvolve();
  if (view === "estimate") renderEstimate(estimateRoot, estimate, current.readWriteRatio);
  if (view === "practice") renderPractice(practiceRoot, scenario);
}

/** Applies new requirements to every view that shows them. */
function applyRequirements(next: typeof current) {
  current = next;
  const rec = recommend(current);
  renderResults(els, rec, currentRec);
  currentRec = rec;
  stages = evolve(current);
  if (view === "evolve") showEvolve();
}

function setView(next: View) {
  view = next;
  showView();
  writeHash();
  // On one-column layouts the view sits below the whole form, so bring it into sight.
  if (!window.matchMedia("(min-width: 1024px)").matches) sections[view].scrollIntoView({ block: "start" });
}

renderRequirements(form, current);
renderResults(els, currentRec, null);
showView();

form.addEventListener("input", () => {
  applyRequirements(readRequirements(form, current));
  writeHash();
});
form.addEventListener("submit", (e) => e.preventDefault());

for (const tab of tabs) tab.addEventListener("click", () => setView(asView(tab.dataset.view)));

evolveEls.root.addEventListener("click", (e) => {
  const button = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-stage]");
  if (!button || button.disabled) return;
  stageIndex = Number(button.dataset.stage);
  showEvolve();
  writeHash();
});

// A box in the Build diagram jumps to that component's card.
els.diagram.addEventListener("click", (e) => {
  const id = (e.target as HTMLElement).closest<HTMLElement>("[data-goto]")?.dataset.goto;
  const card = id ? document.getElementById(`card-${id}`) : null;
  if (!card) return;
  card.scrollIntoView({ block: "start", behavior: "smooth" });
  card.focus({ preventScroll: true });
});

estimateRoot.addEventListener("input", () => {
  const read = readEstimate(estimateRoot, estimate, current.readWriteRatio);
  estimate = read.inputs;
  if (read.readWriteRatio !== current.readWriteRatio) {
    applyRequirements({ ...current, readWriteRatio: read.readWriteRatio });
    renderRequirements(form, current);
  }
  renderEstimateResults(estimateRoot, estimate, current.readWriteRatio);
  writeHash();
});

// "Use this in Build" carries the peak into the requirements and shows the design it calls for.
estimateRoot.addEventListener("click", (e) => {
  const peak = (e.target as HTMLElement).closest<HTMLElement>("[data-use-peak]")?.dataset.usePeak;
  if (!peak) return;
  applyRequirements({ ...current, peakRps: Number(peak) });
  renderRequirements(form, current);
  setView("build");
});

practiceRoot.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const id = target.closest<HTMLElement>("[data-scenario]")?.dataset.scenario;
  if (id) {
    scenario = scenarios.find((s) => s.id === id) ?? scenario;
    renderPractice(practiceRoot, scenario);
    writeHash();
    return;
  }
  // The reference design, loaded into the requirements so Build and Evolve show it.
  if (target.closest("[data-open-build]")) {
    applyRequirements({ ...scenario.requirements });
    renderRequirements(form, current);
    setView("build");
  }
});
practiceRoot.addEventListener("submit", (e) => {
  e.preventDefault();
  renderGrade(practiceRoot, scenario, grade(scenario, readAttempt(practiceRoot)));
});
practiceRoot.addEventListener("reset", () => clearGrade(practiceRoot));
