import { z } from "zod";

import {
  isValidStellarContractId,
  isValidStellarPublicKey,
} from "@/lib/stellar/validation";

const stellarAddress = z
  .string()
  .min(1)
  .refine((value) => isValidStellarPublicKey(value), {
    message: "Must be a valid Stellar public key.",
  });

const stellarContractId = z
  .string()
  .min(1)
  .refine((value) => isValidStellarContractId(value), {
    message: "Must be a valid Stellar contract ID.",
  });

/** A Stellar transaction hash is 64 hex characters; anything else never happened. */
const txHashSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-f]{64}$/i, "Must be a Stellar transaction hash.");

const optionalTxHash = z.union([txHashSchema, z.literal("")]).optional();

/** Free text lands in a row and then on a page; none of it needs to be unbounded. */
const text = (min: number, max: number) => z.string().trim().min(min).max(max);

/** Weights and prices feed the payout maths, where Infinity becomes a broken total. */
const positiveMeasure = (max: number) => z.coerce.number().positive().finite().max(max);

const optionalWalletProofSchema = z.object({
  provider: z.enum(["freighter", "rabet"]).optional(),
  publicKey: z.union([stellarAddress, z.literal("")]).optional(),
  txHash: optionalTxHash,
}).superRefine((value, ctx) => {
  if (value.provider && !value.publicKey) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A public key is required when a wallet provider is supplied.",
      path: ["publicKey"],
    });
  }
});

export const createBatchSchema = z.object({
  assetCode: text(1, 12),
  assetContractAddress: z.union([stellarContractId, z.literal("")]).optional(),
  batchId: z.union([text(3, 64), z.literal("")]).optional(),
  buyerWallet: stellarAddress,
  cooperativeWallet: stellarAddress,
  cropType: text(2, 80),
  expectedPayoutDate: z
    .union([
      z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD date format."),
      z.literal(""),
    ])
    .optional(),
  location: text(2, 160),
  provider: z.enum(["freighter", "rabet"]).optional(),
  registryContractAddress: z.union([stellarContractId, z.literal("")]).optional(),
  season: text(2, 40),
  txHash: optionalTxHash,
  vaultContractAddress: z.union([stellarContractId, z.literal("")]).optional(),
});

export const addFarmerLotSchema = z.object({
  farmerName: text(2, 120),
  farmerWallet: stellarAddress,
  grade: z.coerce.number().int().min(1).max(3),
  // The value becomes a primary key, so it cannot be an arbitrary blob.
  lotId: z.union([text(3, 64), z.literal("")]).optional(),
  pricePerKg: positiveMeasure(1_000_000),
  weightKg: positiveMeasure(10_000_000),
});

export const confirmQualitySchema = optionalWalletProofSchema;

export const fundVaultSchema = z.object({
  provider: z.enum(["freighter", "rabet"]),
  publicKey: stellarAddress,
  txHash: optionalTxHash,
});

export const approveSettlementSchema = z.object({
  provider: z.enum(["freighter", "rabet"]),
  publicKey: stellarAddress,
  txHash: optionalTxHash,
});
