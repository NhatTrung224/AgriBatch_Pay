import type { BatchStatus } from "@/types/domain";

type BatchWorkflowInput = {
  hasLots: boolean;
  hasQualityConfirmation: boolean;
  hasVaultFunding: boolean;
  status: BatchStatus;
  totalAmount: number;
};

export function canAddFarmerLot(status: BatchStatus) {
  return status !== "SETTLED";
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
      addLot: canAddLot ? null : "Settled batches cannot accept new farmer lots.",
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
