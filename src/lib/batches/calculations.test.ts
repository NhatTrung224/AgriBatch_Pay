import { describe, expect, it } from "vitest";

import {
  calculateLotPayout,
  getGradeMultiplier,
  summarizeLotTotals,
} from "@/lib/batches/calculations";

describe("batch calculations", () => {
  it("applies the correct multiplier for premium grades", () => {
    expect(getGradeMultiplier(1)).toBe(1);
    expect(getGradeMultiplier(2)).toBe(1.05);
    expect(getGradeMultiplier(3)).toBe(1.1);
  });

  it("computes lot payout from weight, price, and grade", () => {
    expect(calculateLotPayout(640, 11.4, 1)).toBe(7296);
    expect(calculateLotPayout(640, 11.4, 2)).toBe(7660.8);
  });

  it("summarizes payout and weight totals across lots", () => {
    expect(
      summarizeLotTotals([
        { payoutAmount: 7296, weightKg: 640 },
        { payoutAmount: 7660.8, weightKg: 640 },
      ]),
    ).toEqual({
      totalPayout: 14956.8,
      totalWeightKg: 1280,
    });
  });
});

describe("money stays exact", () => {
  it("keeps the batch total equal to the sum of the rows", () => {
    const lots = [
      { payoutAmount: 0.1, weightKg: 0.1 },
      { payoutAmount: 0.2, weightKg: 0.2 },
    ];

    // Added as floats this is 0.30000000000000004, and that number is what the
    // buyer would have been asked to fund.
    expect(summarizeLotTotals(lots).totalPayout).toBe(0.3);
    expect(summarizeLotTotals(lots).totalWeightKg).toBe(0.3);
  });

  it("adds a long run of cents without drifting", () => {
    const lots = Array.from({ length: 100 }, () => ({ payoutAmount: 0.07, weightKg: 1 }));

    expect(summarizeLotTotals(lots).totalPayout).toBe(7);
  });

  it("ignores a row whose payout never computed", () => {
    const lots = [
      { payoutAmount: 12.5, weightKg: 10 },
      { payoutAmount: Number.NaN, weightKg: Number.NaN },
    ];

    expect(summarizeLotTotals(lots).totalPayout).toBe(12.5);
    expect(summarizeLotTotals(lots).totalWeightKg).toBe(10);
  });

  it("refuses to turn a broken weight or price into a payout", () => {
    expect(calculateLotPayout(Number.POSITIVE_INFINITY, 9.2, 1)).toBe(0);
    expect(calculateLotPayout(10, Number.NaN, 1)).toBe(0);
  });

  it("still prices a normal lot by weight, price and grade", () => {
    expect(calculateLotPayout(100, 9.2, 1)).toBe(920);
    expect(calculateLotPayout(100, 9.2, 2)).toBe(966);
    expect(calculateLotPayout(100, 9.2, 3)).toBe(1012);
  });
});
