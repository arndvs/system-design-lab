import "./styles.css";
import { recommend } from "./engine/recommend";
import { fromHash, toHash } from "./state";
import { readRequirements, renderRequirements } from "./ui/requirements";
import { renderResults, type ResultsEls } from "./ui/results";

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;

const form = $<HTMLFormElement>("#requirements");
const els: ResultsEls = {
  summary: $("#summary"),
  topology: $("#topology"),
  tensions: $("#tensions"),
  changes: $("#changes"),
  list: $("#results"),
};

let current = fromHash(location.hash);
let currentRec = recommend(current);
renderRequirements(form, current);
renderResults(els, currentRec, null);

form.addEventListener("input", () => {
  current = readRequirements(form, current);
  const next = recommend(current);
  renderResults(els, next, currentRec);
  currentRec = next;
  history.replaceState(null, "", `#${toHash(current)}`);
});
form.addEventListener("submit", (e) => e.preventDefault());
