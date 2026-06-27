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
