import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_EXPLORER_BASE_URL: z.string().url(),
  NEXT_PUBLIC_HORIZON_URL: z.string().url(),
  NEXT_PUBLIC_PAYOUT_VAULT_CONTRACT_ID: z.string().optional(),
  NEXT_PUBLIC_REGISTRY_CONTRACT_ID: z.string().optional(),
  NEXT_PUBLIC_STELLAR_NETWORK: z.string().default("testnet"),
  NEXT_PUBLIC_STELLAR_RPC_URL: z.string().url(),
});

const clientDefaults = {
  NEXT_PUBLIC_EXPLORER_BASE_URL: "https://stellar.expert/explorer/testnet",
  NEXT_PUBLIC_HORIZON_URL: "https://horizon-testnet.stellar.org",
  NEXT_PUBLIC_STELLAR_NETWORK: "testnet",
  NEXT_PUBLIC_STELLAR_RPC_URL: "https://soroban-testnet.stellar.org",
} as const;

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_EXPLORER_BASE_URL:
    process.env.NEXT_PUBLIC_EXPLORER_BASE_URL ??
    clientDefaults.NEXT_PUBLIC_EXPLORER_BASE_URL,
  NEXT_PUBLIC_HORIZON_URL:
    process.env.NEXT_PUBLIC_HORIZON_URL ??
    clientDefaults.NEXT_PUBLIC_HORIZON_URL,
  NEXT_PUBLIC_PAYOUT_VAULT_CONTRACT_ID:
    process.env.NEXT_PUBLIC_PAYOUT_VAULT_CONTRACT_ID,
  NEXT_PUBLIC_REGISTRY_CONTRACT_ID:
    process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ID,
  NEXT_PUBLIC_STELLAR_NETWORK:
    process.env.NEXT_PUBLIC_STELLAR_NETWORK ??
    clientDefaults.NEXT_PUBLIC_STELLAR_NETWORK,
  NEXT_PUBLIC_STELLAR_RPC_URL:
    process.env.NEXT_PUBLIC_STELLAR_RPC_URL ??
    clientDefaults.NEXT_PUBLIC_STELLAR_RPC_URL,
});
