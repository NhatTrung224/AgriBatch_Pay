import { z } from "zod";

import { isValidStellarPublicKey } from "@/lib/stellar/validation";

const stellarAddress = z
  .string()
  .min(1)
  .refine((value) => isValidStellarPublicKey(value), {
    message: "Must be a valid Stellar public key.",
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
  season: z.string().min(2),
});

export const addFarmerLotSchema = z.object({
  farmerName: z.string().min(2),
  farmerWallet: stellarAddress,
  grade: z.coerce.number().int().min(1).max(3),
  lotId: z.string().optional().or(z.literal("")),
  pricePerKg: z.coerce.number().positive(),
  weightKg: z.coerce.number().positive(),
});

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
