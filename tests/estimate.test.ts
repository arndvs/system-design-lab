import { describe, expect, it } from "vitest";
import { storage, throughput } from "../src/engine/estimate";

describe("throughput", () => {
  it("works from daily users to peak reads and writes", () => {
    // 100,000 × 10 = 1,000,000/day; ÷ 86,400 ≈ 11.57/s; × 2 ≈ 23.15/s peak
    const { steps, peakRps } = throughput({
      dailyActiveUsers: 100_000,
      requestsPerUserPerDay: 10,
      readWriteRatio: 4,
      peakFactor: 2,
    });
    expect(steps[0]?.value).toBe(1_000_000);
    expect(steps[1]?.value).toBeCloseTo(11.574, 3);
    expect(steps[2]?.value).toBeCloseTo(23.148, 3);
    expect(steps[3]?.value).toBeCloseTo(4.63, 2); // one write in every five requests
    expect(steps[4]?.value).toBeCloseTo(18.519, 3);
    expect(peakRps).toBe(24);
  });

  it("shows the user's numbers in each formula", () => {
    const { steps } = throughput({ dailyActiveUsers: 2_500, requestsPerUserPerDay: 4, readWriteRatio: 1, peakFactor: 3 });
    expect(steps[0]?.formula).toBe("2,500 users × 4 requests");
  });

  it("rejects empty or negative input", () => {
    expect(() =>
      throughput({ dailyActiveUsers: 0, requestsPerUserPerDay: 10, readWriteRatio: 1, peakFactor: 1 }),
    ).toThrow(RangeError);
    expect(() =>
      throughput({ dailyActiveUsers: Number.NaN, requestsPerUserPerDay: 10, readWriteRatio: 1, peakFactor: 1 }),
    ).toThrow(RangeError);
  });
});

describe("storage", () => {
  it("uses decimal units and multiplies by copies", () => {
    // 500 B × 1,000,000/day = 0.5 GB/day; × 3,650 days = 1.825 TB; × 3 copies = 5.475 TB
    const { steps, totalTB } = storage({ bytesPerRecord: 500, newRecordsPerDay: 1_000_000, retentionYears: 10, copies: 3 });
    expect(steps[0]?.value).toBeCloseTo(0.5, 6);
    expect(steps[1]?.value).toBeCloseTo(1.825, 6);
    expect(totalTB).toBeCloseTo(5.475, 6);
  });
});
