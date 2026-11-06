import { AVAILABILITY_TARGETS, type Requirements } from "./content/types";
import { defaultRequirements } from "./engine/recommend";

/** Short URL keys, so shared links stay readable. */
const KEYS: Record<keyof Requirements, string> = {
  dataShape: "data",
  userAccounts: "accounts",
  mediaUploads: "media",
  fullTextSearch: "search",
  asyncWork: "async",
  realtimeAnalytics: "realtime",
  reporting: "reports",
  microservices: "micro",
  serviceCount: "services",
  peakRps: "rps",
  readWriteRatio: "rw",
  availability: "avail",
  latencyMs: "p99",
  consistency: "consistency",
  globalUsers: "global",
  sensitiveData: "sensitive",
};

const ENUMS: Partial<Record<keyof Requirements, readonly (string | number)[]>> = {
  dataShape: ["relational", "key-value", "document", "graph"],
  consistency: ["eventual", "mixed", "strong"],
  availability: AVAILABILITY_TARGETS,
};

/** Encodes only values that differ from the defaults. */
export function toHash(r: Requirements): string {
  const p = new URLSearchParams();
  for (const [field, key] of Object.entries(KEYS) as [keyof Requirements, string][]) {
    const v = r[field];
    if (v === defaultRequirements[field]) continue;
    p.set(key, typeof v === "boolean" ? (v ? "1" : "0") : String(v));
  }
  return p.toString();
}

/** Parses a hash, falling back to defaults for anything missing or invalid. */
export function fromHash(hash: string): Requirements {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const r: Record<string, unknown> = { ...defaultRequirements };
  for (const [field, key] of Object.entries(KEYS) as [keyof Requirements, string][]) {
    const raw = p.get(key);
    if (raw === null) continue;
    const fallback = defaultRequirements[field];
    const allowed = ENUMS[field];
    if (typeof fallback === "boolean") r[field] = raw === "1";
    else if (typeof fallback === "number") {
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0 && (!allowed || allowed.includes(n))) r[field] = n;
    } else if (!allowed || allowed.includes(raw)) r[field] = raw;
  }
  return r as Requirements;
}
