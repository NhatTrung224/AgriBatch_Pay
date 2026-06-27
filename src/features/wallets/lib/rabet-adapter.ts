"use client";

import { Networks } from "@stellar/stellar-sdk";

import { clientEnv } from "@/lib/env/client";
import type { WalletAdapter } from "@/features/wallets/types";

type RabetApi = {
  connect(): Promise<{ publicKey: string }>;
  sign(
    xdr: string,
    network: "mainnet" | "testnet",
  ): Promise<{ xdr?: string } | undefined>;
};

function getRabetWindow() {
  return window as Window & {
    rabet?: RabetApi;
  };
}

function getExpectedRabetNetwork(
  networkPassphrase = clientEnv.NEXT_PUBLIC_STELLAR_NETWORK,
) {
  const value = networkPassphrase.toLowerCase();

  if (value.includes("testnet") || networkPassphrase === Networks.TESTNET) {
    return "testnet" as const;
  }

  if (value.includes("public") || value.includes("mainnet") || networkPassphrase === Networks.PUBLIC) {
    return "mainnet" as const;
  }

  throw new Error(`Unsupported network for Rabet: ${networkPassphrase}`);
}

async function ensureRabetAvailable() {
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (typeof window === "undefined" || !getRabetWindow().rabet) {
    throw new Error("Rabet is not installed in this browser.");
  }
}

export const rabetAdapter: WalletAdapter = {
  provider: "rabet",
  async isInstalled() {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return typeof window !== "undefined" && Boolean(getRabetWindow().rabet);
  },
  async connect() {
    await ensureRabetAvailable();

    const result = await getRabetWindow().rabet!.connect();

    if (!result.publicKey) {
      throw new Error("Rabet did not return a public key.");
    }

    return {
      network: `Stellar ${getExpectedRabetNetwork()} (assumed)`,
      publicKey: result.publicKey,
    };
  },
  async disconnect() {
    return;
  },
  async signTransaction(xdr: string, opts?: unknown) {
    await ensureRabetAvailable();

    const network = getExpectedRabetNetwork(
      (opts as { networkPassphrase?: string } | undefined)?.networkPassphrase,
    );
    const signed = await getRabetWindow().rabet!.sign(xdr, network);

    if (!signed?.xdr) {
      throw new Error("Rabet transaction signing failed.");
    }

    return signed.xdr;
  },
};
