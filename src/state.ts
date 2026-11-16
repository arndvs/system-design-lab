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
  languageModel: "llm",
  documentAnswers: "docs",
  selfHostedModel: "selfhost",
  serviceCount: "services",
  independentTeams: "teams",
  unevenScaling: "scaling",
  opsMaturity: "ops",
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
  opsMaturity: ["limited", "solid"],
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

/**
 * Links made before application shape existed used `micro=1` to mean "split
 * into services". Map it to the team and ops inputs that now produce the same
 * shape. New keys always win when both are present.
 */
function withLegacyKeys(p: URLSearchParams): URLSearchParams {
  if (p.get("micro") !== "1") return p;
  const migrated = new URLSearchParams(p);
  migrated.delete("micro");
  if (!migrated.has("ops")) migrated.set("ops", "solid");
  if (!migrated.has("teams")) migrated.set("teams", "3");
  return migrated;
}

/** Parses a hash, falling back to defaults for anything missing or invalid. */
export function fromHash(hash: string): Requirements {
  const p = withLegacyKeys(new URLSearchParams(hash.replace(/^#/, "")));
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

/** Inputs to the Estimate view. Reads per write is shared with the requirements. */
export type EstimateInputs = {
  dailyActiveUsers: number;
  requestsPerUserPerDay: number;
  peakFactor: number;
  bytesPerRecord: number;
  newRecordsPerDay: number;
  retentionYears: number;
  copies: number;
};

export const defaultEstimate: EstimateInputs = {
  dailyActiveUsers: 1_000_000,
  requestsPerUserPerDay: 20,
  peakFactor: 3,
  bytesPerRecord: 1_000,
  newRecordsPerDay: 1_000_000,
  retentionYears: 5,
  copies: 3,
};

const ESTIMATE_KEYS: Record<keyof EstimateInputs, string> = {
  dailyActiveUsers: "dau",
  requestsPerUserPerDay: "rpu",
  peakFactor: "peak",
  bytesPerRecord: "bytes",
  newRecordsPerDay: "records",
  retentionYears: "years",
  copies: "copies",
};

/** Reads estimate inputs from a hash, using the default for anything missing or not a positive number. */
export function estimateFromHash(hash: string): EstimateInputs {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const out = { ...defaultEstimate };
  for (const [field, key] of Object.entries(ESTIMATE_KEYS) as [keyof EstimateInputs, string][]) {
    const n = Number(p.get(key));
    if (p.has(key) && Number.isFinite(n) && n > 0) out[field] = n;
  }
  return out;
}

/** Hash entries for the estimate inputs that differ from the defaults. */
export function estimateToParams(e: EstimateInputs): [string, string][] {
  return (Object.entries(ESTIMATE_KEYS) as [keyof EstimateInputs, string][])
    .filter(([field]) => e[field] !== defaultEstimate[field])
    .map(([field, key]) => [key, String(e[field])]);
}
