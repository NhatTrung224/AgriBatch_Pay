import type { BatchStatus } from "@/types/domain";

type BatchWorkflowInput = {
  hasLots: boolean;
  hasQualityConfirmation: boolean;
  hasVaultFunding: boolean;
  status: BatchStatus;
  totalAmount: number;
};

/**
 * Lots may only be added while the batch is still being assembled. Adding one
 * after the buyer funded the vault raises the total the farmers are owed without
 * raising what was deposited, and settlement would then approve a payout the
 * vault cannot cover. Quality confirmation attests to the lots that existed when
 * it was given, so it closes the list too.
 */
const LOTS_CLOSED_AFTER: BatchStatus[] = [
  "FUNDED",
  "QUALITY_CONFIRMED",
  "SETTLEMENT_APPROVED",
  "SETTLED",
];

export function canAddFarmerLot(status: BatchStatus) {
  return !LOTS_CLOSED_AFTER.includes(status);
}

export function canConfirmQuality(input: Pick<BatchWorkflowInput, "hasLots" | "status">) {
  return input.hasLots && !["QUALITY_CONFIRMED", "SETTLED"].includes(input.status);
}

export function canFundVault(
  input: Pick<BatchWorkflowInput, "status" | "totalAmount">,
) {
  return input.totalAmount > 0 && !["FUNDED", "SETTLED"].includes(input.status);
}

export function canApproveSettlement(input: BatchWorkflowInput) {
  return (
    input.hasLots &&
    input.hasQualityConfirmation &&
    input.hasVaultFunding &&
    input.status !== "SETTLED"
  );
}

export function getBatchWorkflowState(input: BatchWorkflowInput) {
  const canAddLot = canAddFarmerLot(input.status);
  const canConfirm = canConfirmQuality(input);
  const canFund = canFundVault(input);
  const canApprove = canApproveSettlement(input);

  return {
    canAddLot,
    canApprove,
    canConfirm,
    canFund,
    reasons: {
      addLot: canAddLot
        ? null
        : "Farmer lots close once the vault is funded or quality is confirmed.",
      approve: canApprove
        ? null
        : !input.hasLots
          ? "Add at least one farmer lot before settlement approval."
          : !input.hasVaultFunding
            ? "Buyer must fund the payout vault before settlement approval."
            : !input.hasQualityConfirmation
              ? "Cooperative must confirm quality before settlement approval."
              : "This batch is already settled.",
      confirm: canConfirm
        ? null
        : !input.hasLots
          ? "You need at least one farmer lot before confirming quality."
          : "Quality is already confirmed for this batch.",
      fund: canFund
        ? null
        : input.totalAmount <= 0
          ? "Funding unlocks after farmer lots create a positive payout amount."
          : "This batch is already funded or settled.",
    },
  };
}
