import { glossary } from "../content/glossary";

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

/** A glossary term the reader can hover or focus to see its definition. */
export function term(key: string): string {
  const g = glossary[key];
  if (!g) return "";
  return `<span tabindex="0" title="${esc(g.definition)}"
    class="cursor-help rounded bg-raised px-2 py-0.5 text-xs underline decoration-zinc-500 decoration-dotted underline-offset-2">${esc(g.term)}</span>`;
}
