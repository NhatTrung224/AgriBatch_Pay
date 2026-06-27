import { describe, expect, it } from "vitest";

import { getBatchWorkflowState } from "@/features/batches/workflow";

describe("batch workflow guards", () => {
  it("blocks settlement approval before funding and quality confirmation", () => {
    expect(
      getBatchWorkflowState({
        hasLots: true,
        hasQualityConfirmation: false,
        hasVaultFunding: false,
        status: "LOTS_ADDED",
        totalAmount: 6400,
      }),
    ).toMatchObject({
      canAddLot: true,
      canApprove: false,
      canConfirm: true,
      canFund: true,
    });
  });

  it("unlocks settlement approval only when all prerequisites are met", () => {
    expect(
      getBatchWorkflowState({
        hasLots: true,
        hasQualityConfirmation: true,
        hasVaultFunding: true,
        status: "FUNDED",
        totalAmount: 6400,
      }).canApprove,
    ).toBe(true);
  });
});
