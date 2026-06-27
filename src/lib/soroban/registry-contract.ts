import { Address, nativeToScVal } from "@stellar/stellar-sdk";

import { getWalletAdapter } from "@/features/wallets/lib/adapters";
import type { WalletProvider } from "@/types/domain";
import { clientEnv } from "@/lib/env/client";
import { invokeSorobanContract } from "@/lib/soroban/invoke-contract";

type CreateBatchOnSorobanArgs = {
  assetCode: string;
  batchId: string;
  buyerWallet: string;
  cooperativeWallet: string;
  cropType: string;
  location: string;
  provider: WalletProvider;
  season: string;
  vaultContractId: string;
};

type ConfirmQualityOnSorobanArgs = {
  batchId: string;
  provider: WalletProvider;
  publicKey: string;
};

function getRequiredRegistryContractId() {
  const contractId = clientEnv.NEXT_PUBLIC_REGISTRY_CONTRACT_ID?.trim();

  if (!contractId) {
    throw new Error("NEXT_PUBLIC_REGISTRY_CONTRACT_ID is not configured.");
  }

  return contractId;
}

export function getConfiguredRegistryContractId() {
  return clientEnv.NEXT_PUBLIC_REGISTRY_CONTRACT_ID?.trim() || null;
}

export async function createBatchOnSoroban(args: CreateBatchOnSorobanArgs) {
  const contractId = getRequiredRegistryContractId();

  return invokeSorobanContract({
    args: [
      nativeToScVal(args.batchId, { type: "string" }),
      new Address(args.buyerWallet).toScVal(),
      new Address(args.cooperativeWallet).toScVal(),
      nativeToScVal(args.assetCode, { type: "string" }),
      nativeToScVal(args.cropType, { type: "string" }),
      nativeToScVal(args.season, { type: "string" }),
      nativeToScVal(args.location, { type: "string" }),
      new Address(args.vaultContractId).toScVal(),
    ],
    contractId,
    method: "create_batch",
    wallet: {
      adapter: getWalletAdapter(args.provider),
      publicKey: args.cooperativeWallet,
    },
  });
}

export async function confirmQualityOnSoroban(args: ConfirmQualityOnSorobanArgs) {
  const contractId = getRequiredRegistryContractId();

  return invokeSorobanContract({
    args: [
      nativeToScVal(args.batchId, { type: "string" }),
      new Address(args.publicKey).toScVal(),
    ],
    contractId,
    method: "confirm_quality",
    wallet: {
      adapter: getWalletAdapter(args.provider),
      publicKey: args.publicKey,
    },
  });
}

export async function getBatchFromSoroban(batchId: string, publicKey: string) {
  const contractId = getRequiredRegistryContractId();

  return invokeSorobanContract({
    args: [nativeToScVal(batchId, { type: "string" })],
    contractId,
    method: "get_batch",
    wallet: {
      adapter: getWalletAdapter("freighter"),
      publicKey,
    },
  });
}
