import "./styles.css";
import { evolve } from "./engine/evolve";
import { recommend } from "./engine/recommend";
import { fromHash, toHash } from "./state";
import { renderEvolve, type EvolveEls } from "./ui/evolve";
import { readRequirements, renderRequirements } from "./ui/requirements";
import { renderResults, type ResultsEls } from "./ui/results";

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;

type View = "build" | "evolve";

const form = $<HTMLFormElement>("#requirements");
const els: ResultsEls = {
  summary: $("#summary"),
  shape: $("#shape"),
  topology: $("#topology"),
  tensions: $("#tensions"),
  changes: $("#changes"),
  list: $("#results"),
};
const evolveEls: EvolveEls = { summary: $("#evolve-summary"), root: $("#evolve") };
const sections: Record<View, HTMLElement> = { build: $("#view-build"), evolve: $("#view-evolve") };
const tabs = [...document.querySelectorAll<HTMLButtonElement>("[data-view]")];

// The view and the stage ride in the hash beside the requirements, so a link
// opens on the same screen. They are not requirements, so state.ts ignores them.
const params = new URLSearchParams(location.hash.replace(/^#/, ""));
let view: View = params.get("view") === "evolve" ? "evolve" : "build";
let stageIndex = Math.max(0, Number(params.get("stage") ?? 1) - 1) || 0;

let current = fromHash(location.hash);
let currentRec = recommend(current);
let stages = evolve(current);

function writeHash() {
  const p = new URLSearchParams(toHash(current));
  if (view === "evolve") {
    p.set("view", "evolve");
    if (stageIndex > 0) p.set("stage", String(stageIndex + 1));
  }
  history.replaceState(null, "", `#${p.toString()}`);
}

function showEvolve() {
  stageIndex = Math.min(stageIndex, stages.length - 1);
  renderEvolve(evolveEls, stages, stageIndex, currentRec.topology);
}

function showView() {
  for (const [name, el] of Object.entries(sections)) el.hidden = name !== view;
  for (const tab of tabs) {
    if (tab.dataset.view === view) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  }
  if (view === "evolve") showEvolve();
}

renderRequirements(form, current);
renderResults(els, currentRec, null);
showView();

form.addEventListener("input", () => {
  current = readRequirements(form, current);
  const next = recommend(current);
  renderResults(els, next, currentRec);
  currentRec = next;
  stages = evolve(current);
  if (view === "evolve") showEvolve();
  writeHash();
});
form.addEventListener("submit", (e) => e.preventDefault());

for (const tab of tabs) {
  tab.addEventListener("click", () => {
    view = tab.dataset.view === "evolve" ? "evolve" : "build";
    showView();
    writeHash();
    // On one-column layouts the view sits below the whole form, so bring it into sight.
    if (!window.matchMedia("(min-width: 1024px)").matches) sections[view].scrollIntoView({ block: "start" });
  });
}

evolveEls.root.addEventListener("click", (e) => {
  const button = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-stage]");
  if (!button || button.disabled) return;
  stageIndex = Number(button.dataset.stage);
  showEvolve();
  writeHash();
});
