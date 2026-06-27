import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3000),
});

const clientSchema = z.object({
  NEXT_PUBLIC_EXPLORER_BASE_URL: z.string().url(),
  NEXT_PUBLIC_HORIZON_URL: z.string().url(),
  NEXT_PUBLIC_PAYOUT_VAULT_CONTRACT_ID: z.string().optional(),
  NEXT_PUBLIC_REGISTRY_CONTRACT_ID: z.string().optional(),
  NEXT_PUBLIC_STELLAR_NETWORK: z.string().default("testnet"),
  NEXT_PUBLIC_STELLAR_RPC_URL: z.string().url(),
});

export const serverEnv = serverSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT,
});

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_EXPLORER_BASE_URL: process.env.NEXT_PUBLIC_EXPLORER_BASE_URL,
  NEXT_PUBLIC_HORIZON_URL: process.env.NEXT_PUBLIC_HORIZON_URL,
  NEXT_PUBLIC_PAYOUT_VAULT_CONTRACT_ID:
    process.env.NEXT_PUBLIC_PAYOUT_VAULT_CONTRACT_ID,
  NEXT_PUBLIC_REGISTRY_CONTRACT_ID:
    process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ID,
  NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
  NEXT_PUBLIC_STELLAR_RPC_URL: process.env.NEXT_PUBLIC_STELLAR_RPC_URL,
});
