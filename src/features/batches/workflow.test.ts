import { describe, expect, it } from "vitest";

import {
  canAddFarmerLot,
  furthestStatus,
  getBatchWorkflowState,
} from "@/features/batches/workflow";

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

describe("furthestStatus", () => {
  it("moves a batch forward", () => {
    expect(furthestStatus("CREATED", "LOTS_ADDED")).toBe("LOTS_ADDED");
    expect(furthestStatus("LOTS_ADDED", "VAULT_REGISTERED")).toBe("VAULT_REGISTERED");
    expect(furthestStatus("FUNDED", "QUALITY_CONFIRMED")).toBe("QUALITY_CONFIRMED");
  });

  it("keeps a batch that has already travelled further", () => {
    // Adding a lot recalculates and proposes LOTS_ADDED; a registered vault must
    // not be forgotten because of it.
    expect(furthestStatus("VAULT_REGISTERED", "LOTS_ADDED")).toBe("VAULT_REGISTERED");
    expect(furthestStatus("SETTLED", "CREATED")).toBe("SETTLED");
  });

  it("stays where it is when nothing changes", () => {
    expect(furthestStatus("FUNDED", "FUNDED")).toBe("FUNDED");
  });

  it("lets a failure be recorded from anywhere, and recovered from", () => {
    expect(furthestStatus("SETTLED", "FAILED")).toBe("FAILED");
    expect(furthestStatus("FAILED", "CREATED")).toBe("CREATED");
  });
});
