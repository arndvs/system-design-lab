import { failures } from "../content/failures";

export type FailureView = {
  breaks: string;
  contain: string;
  /** Components in this design that limit the damage. */
  helping: { id: string; how: string }[];
  /** Components that would limit it but are not in this design. */
  missing: { id: string; how: string }[];
};

/** What happens when `id` fails inside a design made of `design`. */
export function failureIn(id: string, design: Iterable<string>): FailureView {
  const f = failures[id];
  if (!f) throw new Error(`No failure entry for ${id}`);
  const present = new Set(design);
  return {
    breaks: f.breaks,
    contain: f.contain,
    helping: f.helpedBy.filter((h) => present.has(h.id)),
    missing: f.helpedBy.filter((h) => !present.has(h.id)),
  };
}
