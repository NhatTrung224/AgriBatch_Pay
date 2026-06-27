import { Address, nativeToScVal } from "@stellar/stellar-sdk";

import { getWalletAdapter } from "@/features/wallets/lib/adapters";
import type { WalletProvider } from "@/types/domain";
import { clientEnv } from "@/lib/env/client";
import { invokeSorobanContract } from "@/lib/soroban/invoke-contract";

type FundVaultOnSorobanArgs = {
  amount: number;
  batchId: string;
  provider: WalletProvider;
  publicKey: string;
  registryContractId: string;
};

type ApproveSettlementOnSorobanArgs = {
  batchId: string;
  provider: WalletProvider;
  publicKey: string;
};

function getRequiredVaultContractId() {
  const contractId = clientEnv.NEXT_PUBLIC_PAYOUT_VAULT_CONTRACT_ID?.trim();

  if (!contractId) {
    throw new Error("NEXT_PUBLIC_PAYOUT_VAULT_CONTRACT_ID is not configured.");
  }

  return contractId;
}

export function getConfiguredPayoutVaultContractId() {
  return clientEnv.NEXT_PUBLIC_PAYOUT_VAULT_CONTRACT_ID?.trim() || null;
}

function toContractAmount(amount: number) {
  return BigInt(Math.round(amount * 100));
}

export async function fundVaultOnSoroban(args: FundVaultOnSorobanArgs) {
  const contractId = getRequiredVaultContractId();

  return invokeSorobanContract({
    args: [
      nativeToScVal(args.batchId, { type: "string" }),
      new Address(args.publicKey).toScVal(),
      new Address(args.registryContractId).toScVal(),
      nativeToScVal(toContractAmount(args.amount), { type: "i128" }),
    ],
    contractId,
    method: "fund_vault",
    wallet: {
      adapter: getWalletAdapter(args.provider),
      publicKey: args.publicKey,
    },
  });
}

export async function approveSettlementOnSoroban(
  args: ApproveSettlementOnSorobanArgs,
) {
  const contractId = getRequiredVaultContractId();

  return invokeSorobanContract({
    args: [
      nativeToScVal(args.batchId, { type: "string" }),
      new Address(args.publicKey).toScVal(),
    ],
    contractId,
    method: "approve_settlement",
    wallet: {
      adapter: getWalletAdapter(args.provider),
      publicKey: args.publicKey,
    },
  });
}

export async function getVaultReleaseFromSoroban(batchId: string, publicKey: string) {
  const contractId = getRequiredVaultContractId();

  return invokeSorobanContract({
    args: [nativeToScVal(batchId, { type: "string" })],
    contractId,
    method: "get_release",
    wallet: {
      adapter: getWalletAdapter("freighter"),
      publicKey,
    },
  });
}
