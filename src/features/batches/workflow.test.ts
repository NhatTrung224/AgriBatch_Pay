import { describe, expect, it } from "vitest";

import { canAddFarmerLot, getBatchWorkflowState } from "@/features/batches/workflow";

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

describe("lots close before the money moves", () => {
  it("accepts lots while the batch is still being assembled", () => {
    expect(canAddFarmerLot("CREATED")).toBe(true);
    expect(canAddFarmerLot("LOTS_ADDED")).toBe(true);
    expect(canAddFarmerLot("VAULT_REGISTERED")).toBe(true);
  });

  it("refuses a lot that would outgrow what the buyer already funded", () => {
    expect(canAddFarmerLot("FUNDED")).toBe(false);
    expect(canAddFarmerLot("QUALITY_CONFIRMED")).toBe(false);
    expect(canAddFarmerLot("SETTLEMENT_APPROVED")).toBe(false);
    expect(canAddFarmerLot("SETTLED")).toBe(false);
  });

  it("explains why the lot form is closed", () => {
    const state = getBatchWorkflowState({
      hasLots: true,
      hasQualityConfirmation: false,
      hasVaultFunding: true,
      status: "FUNDED",
      totalAmount: 1000,
    });

    expect(state.canAddLot).toBe(false);
    expect(state.reasons.addLot).toMatch(/vault is funded or quality is confirmed/i);
  });
});
