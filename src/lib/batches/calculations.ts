import type { FarmerLotRecord } from "@/types/domain";

export const gradeMultipliers = {
  1: 1,
  2: 1.05,
  3: 1.1,
} as const;

export function getGradeMultiplier(grade: number) {
  return gradeMultipliers[grade as keyof typeof gradeMultipliers] ?? 1;
}

/** Payouts are quoted to the cent; carrying more only invents precision. */
const CENTS = 100;

function toCents(value: number) {
  return Math.round(value * CENTS);
}

export function calculateLotPayout(
  weightKg: number,
  pricePerKg: number,
  grade: number,
) {
  const raw = weightKg * pricePerKg * getGradeMultiplier(grade);

  // A non-finite weight or price used to produce NaN here and then flow into the
  // batch total, the vault funding check and the payout the farmer is owed.
  if (!Number.isFinite(raw)) {
    return 0;
  }

  return toCents(raw) / CENTS;
}

/**
 * Adding the payouts as floats drifts: 0.1 + 0.2 is 0.30000000000000004, and the
 * batch total is what the buyer is asked to fund. Summing whole cents and dividing
 * once at the end keeps the total equal to the sum of the rows a farmer can read.
 */
export function summarizeLotTotals(
  lots: Array<Pick<FarmerLotRecord, "payoutAmount" | "weightKg">>,
) {
  const totals = lots.reduce(
    (summary, lot) => {
      if (Number.isFinite(lot.payoutAmount)) {
        summary.payoutCents += toCents(lot.payoutAmount);
      }

      if (Number.isFinite(lot.weightKg)) {
        summary.weightGrams += Math.round(lot.weightKg * 1000);
      }

      return summary;
    },
    { payoutCents: 0, weightGrams: 0 },
  );

  return {
    totalPayout: totals.payoutCents / CENTS,
    totalWeightKg: totals.weightGrams / 1000,
  };
}
