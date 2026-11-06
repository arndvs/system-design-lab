export type Step = { label: string; formula: string; value: number; unit: string };

const SECONDS_PER_DAY = 86_400;
const fmt = (n: number, digits = 1) =>
  n.toLocaleString("en-US", { maximumFractionDigits: digits });

export type ThroughputInput = {
  dailyActiveUsers: number;
  requestsPerUserPerDay: number;
  /** Reads per write. */
  readWriteRatio: number;
  /** Peak traffic as a multiple of the daily average. */
  peakFactor: number;
};

export function throughput(i: ThroughputInput): { steps: Step[]; peakRps: number } {
  assertPositive(i);
  const daily = i.dailyActiveUsers * i.requestsPerUserPerDay;
  const avg = daily / SECONDS_PER_DAY;
  const peak = avg * i.peakFactor;
  const writeShare = 1 / (i.readWriteRatio + 1);
  const steps: Step[] = [
    {
      label: "Requests per day",
      formula: `${fmt(i.dailyActiveUsers, 0)} users × ${fmt(i.requestsPerUserPerDay)} requests`,
      value: daily,
      unit: "req/day",
    },
    { label: "Average rate", formula: `${fmt(daily, 0)} ÷ 86,400 seconds`, value: avg, unit: "req/s" },
    { label: "Peak rate", formula: `${fmt(avg)} × ${fmt(i.peakFactor)} peak factor`, value: peak, unit: "req/s" },
    {
      label: "Peak writes",
      formula: `${fmt(peak)} × 1/(${fmt(i.readWriteRatio)}+1)`,
      value: peak * writeShare,
      unit: "writes/s",
    },
    {
      label: "Peak reads",
      formula: `${fmt(peak)} − ${fmt(peak * writeShare)}`,
      value: peak * (1 - writeShare),
      unit: "reads/s",
    },
  ];
  return { steps, peakRps: Math.ceil(peak) };
}

export type StorageInput = {
  bytesPerRecord: number;
  newRecordsPerDay: number;
  retentionYears: number;
  /** Total copies kept, e.g. 3 for a primary plus two replicas. */
  copies: number;
};

/** Uses decimal units (1 GB = 10^9 bytes, 1 TB = 10^12), as cloud providers bill. */
export function storage(i: StorageInput): { steps: Step[]; totalTB: number } {
  assertPositive(i);
  const perDay = i.bytesPerRecord * i.newRecordsPerDay;
  const days = i.retentionYears * 365;
  const raw = perDay * days;
  const total = raw * i.copies;
  const steps: Step[] = [
    {
      label: "Written per day",
      formula: `${fmt(i.bytesPerRecord, 0)} bytes × ${fmt(i.newRecordsPerDay, 0)} records`,
      value: perDay / 1e9,
      unit: "GB/day",
    },
    {
      label: "Kept over retention",
      formula: `${fmt(perDay / 1e9, 2)} GB × ${fmt(days, 0)} days`,
      value: raw / 1e12,
      unit: "TB",
    },
    {
      label: "With copies",
      formula: `${fmt(raw / 1e12, 2)} TB × ${fmt(i.copies, 0)} copies`,
      value: total / 1e12,
      unit: "TB",
    },
  ];
  return { steps, totalTB: total / 1e12 };
}

function assertPositive(input: Record<string, number>) {
  for (const [key, v] of Object.entries(input)) {
    if (!Number.isFinite(v) || v <= 0) throw new RangeError(`${key} must be a positive number`);
  }
}
