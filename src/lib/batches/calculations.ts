import type { FarmerLotRecord } from "@/types/domain";

export const gradeMultipliers = {
  1: 1,
  2: 1.05,
  3: 1.1,
} as const;

export function getGradeMultiplier(grade: number) {
  return gradeMultipliers[grade as keyof typeof gradeMultipliers] ?? 1;
}

export function calculateLotPayout(
  weightKg: number,
  pricePerKg: number,
  grade: number,
) {
  return Number((weightKg * pricePerKg * getGradeMultiplier(grade)).toFixed(2));
}

export function summarizeLotTotals(
  lots: Array<Pick<FarmerLotRecord, "payoutAmount" | "weightKg">>,
) {
  return lots.reduce(
    (summary, lot) => {
      summary.totalPayout += lot.payoutAmount;
      summary.totalWeightKg += lot.weightKg;

      return summary;
    },
    { totalPayout: 0, totalWeightKg: 0 },
  );
}
