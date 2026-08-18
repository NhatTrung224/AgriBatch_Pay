import { StrKey } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";

import { addFarmerLotSchema, createBatchSchema, fundVaultSchema } from "./batches";

// Real StrKey values: the schema runs Stellar's own checksum, so a hand-built
// "G..." string is rejected before the rule under test is ever reached. Encoded
// from fixed bytes rather than generated, because the suite runs under jsdom and
// the SDK's RNG path does not survive that environment.
const buyer = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 11));
const cooperative = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 22));
const txHash = "9ee153f865e43215ee379cd9878cf5eeb5cc07db1e908a2293e2e1b80785a787";

function batchInput(overrides: Record<string, unknown> = {}) {
  return {
    assetCode: "USDC",
    buyerWallet: buyer,
    cooperativeWallet: cooperative,
    cropType: "Robusta coffee",
    location: "Dak Lak",
    season: "2026 spring",
    ...overrides,
  };
}

function lotInput(overrides: Record<string, unknown> = {}) {
  return {
    farmerName: "Nguyen Van A",
    farmerWallet: cooperative,
    grade: 2,
    pricePerKg: 9.2,
    weightKg: 120,
    ...overrides,
  };
}

describe("createBatchSchema", () => {
  it("accepts a well-formed batch", () => {
    expect(createBatchSchema.parse(batchInput()).cropType).toBe("Robusta coffee");
  });

  it("rejects free text longer than a row needs", () => {
    expect(() => createBatchSchema.parse(batchInput({ cropType: "x".repeat(81) }))).toThrow();
    expect(() => createBatchSchema.parse(batchInput({ location: "y".repeat(161) }))).toThrow();
  });

  it("accepts an empty hash but rejects one that is not a hash", () => {
    expect(createBatchSchema.parse(batchInput({ txHash: "" })).txHash).toBe("");
    expect(createBatchSchema.parse(batchInput({ txHash })).txHash).toBe(txHash);
    expect(() => createBatchSchema.parse(batchInput({ txHash: "pending-123" }))).toThrow();
  });

  it("rejects a payout date that is not a calendar day", () => {
    expect(() => createBatchSchema.parse(batchInput({ expectedPayoutDate: "next friday" }))).toThrow();
    expect(createBatchSchema.parse(batchInput({ expectedPayoutDate: "2026-09-01" })).expectedPayoutDate).toBe(
      "2026-09-01",
    );
  });
});

describe("addFarmerLotSchema", () => {
  it("accepts a well-formed lot", () => {
    expect(addFarmerLotSchema.parse(lotInput()).weightKg).toBe(120);
  });

  it("rejects a weight or price that would break the payout maths", () => {
    expect(() => addFarmerLotSchema.parse(lotInput({ weightKg: Number.POSITIVE_INFINITY }))).toThrow();
    expect(() => addFarmerLotSchema.parse(lotInput({ pricePerKg: 0 }))).toThrow();
    expect(() => addFarmerLotSchema.parse(lotInput({ weightKg: 10_000_001 }))).toThrow();
  });

  it("rejects a grade outside the published scale", () => {
    expect(() => addFarmerLotSchema.parse(lotInput({ grade: 0 }))).toThrow();
    expect(() => addFarmerLotSchema.parse(lotInput({ grade: 4 }))).toThrow();
  });

  it("rejects a lot id that would not fit a key", () => {
    expect(() => addFarmerLotSchema.parse(lotInput({ lotId: "z".repeat(65) }))).toThrow();
    expect(() => addFarmerLotSchema.parse(lotInput({ lotId: "ab" }))).toThrow();
  });
});

describe("fundVaultSchema", () => {
  it("requires a provider and a real key", () => {
    expect(fundVaultSchema.parse({ provider: "freighter", publicKey: buyer }).publicKey).toBe(buyer);
    expect(() => fundVaultSchema.parse({ provider: "freighter", publicKey: "nope" })).toThrow();
  });
});

describe("separation of duties", () => {
  it("refuses one wallet holding both sides of the batch", () => {
    expect(() =>
      createBatchSchema.parse(batchInput({ cooperativeWallet: buyer })),
    ).toThrow("The buyer and cooperative must be different wallets.");
  });

  it("accepts two distinct wallets", () => {
    const parsed = createBatchSchema.parse(batchInput());

    expect(parsed.buyerWallet).not.toBe(parsed.cooperativeWallet);
  });
});
