import type { Requirements } from "./content/types";
import { defaultRequirements } from "./engine/recommend";

const BOOL_KEYS = [
  "strongConsistency",
  "highAvailability",
  "globalUsers",
  "lowLatency",
  "eventDriven",
  "mediaUploads",
] as const satisfies readonly (keyof Requirements)[];

/** Encodes only values that differ from the defaults, so shared URLs stay short. */
export function toHash(r: Requirements): string {
  const p = new URLSearchParams();
  if (r.peakRps !== defaultRequirements.peakRps) p.set("rps", String(r.peakRps));
  if (r.readWriteRatio !== defaultRequirements.readWriteRatio) p.set("rw", String(r.readWriteRatio));
  if (r.dataShape !== defaultRequirements.dataShape) p.set("data", r.dataShape);
  for (const k of BOOL_KEYS) if (r[k]) p.set(k, "1");
  return p.toString();
}

export function fromHash(hash: string): Requirements {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const num = (key: string, fallback: number) => {
    const n = Number(p.get(key));
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  const r: Requirements = {
    ...defaultRequirements,
    peakRps: num("rps", defaultRequirements.peakRps),
    readWriteRatio: num("rw", defaultRequirements.readWriteRatio),
    dataShape: p.get("data") === "key-value" ? "key-value" : "relational",
  };
  for (const k of BOOL_KEYS) r[k] = p.get(k) === "1";
  return r;
}
