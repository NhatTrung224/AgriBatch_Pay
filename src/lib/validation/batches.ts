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

const optionalWalletProofSchema = z.object({
  provider: z.enum(["freighter", "rabet"]).optional(),
  publicKey: z.union([stellarAddress, z.literal("")]).optional(),
  txHash: z.string().optional().or(z.literal("")),
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
  assetCode: z.string().min(1),
  assetContractAddress: z.string().optional().or(z.literal("")),
  batchId: z.string().optional().or(z.literal("")),
  buyerWallet: stellarAddress,
  cooperativeWallet: stellarAddress,
  cropType: z.string().min(2),
  expectedPayoutDate: z.string().optional().or(z.literal("")),
  location: z.string().min(2),
  provider: z.enum(["freighter", "rabet"]).optional(),
  registryContractAddress: z.union([stellarContractId, z.literal("")]).optional(),
  season: z.string().min(2),
  txHash: z.string().optional().or(z.literal("")),
  vaultContractAddress: z.union([stellarContractId, z.literal("")]).optional(),
});

export const addFarmerLotSchema = z.object({
  farmerName: z.string().min(2),
  farmerWallet: stellarAddress,
  grade: z.coerce.number().int().min(1).max(3),
  lotId: z.string().optional().or(z.literal("")),
  pricePerKg: z.coerce.number().positive(),
  weightKg: z.coerce.number().positive(),
});

export const confirmQualitySchema = optionalWalletProofSchema;

export const fundVaultSchema = z.object({
  provider: z.enum(["freighter", "rabet"]),
  publicKey: stellarAddress,
  txHash: z.string().optional().or(z.literal("")),
});

export const approveSettlementSchema = z.object({
  provider: z.enum(["freighter", "rabet"]),
  publicKey: stellarAddress,
  txHash: z.string().optional().or(z.literal("")),
});
