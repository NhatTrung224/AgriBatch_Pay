"use client";

import {
  getNetworkDetails,
  isConnected,
  requestAccess,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";

import { clientEnv } from "@/lib/env/client";
import type { WalletAdapter } from "@/features/wallets/types";

function normalizeNetworkLabel(network: string) {
  return network.trim().toLowerCase();
}

function assertFreighterError(message: string) {
  throw new Error(message);
}

export const freighterAdapter: WalletAdapter = {
  provider: "freighter",
  async isInstalled() {
    const connected = await isConnected();
    return !connected.error && Boolean(connected.isConnected);
  },
  async connect() {
    if (!(await this.isInstalled())) {
      assertFreighterError("Freighter is not installed in this browser.");
    }

    const access = await requestAccess();

    if (access.error || !access.address) {
      assertFreighterError(access.error?.message ?? "Freighter access was rejected.");
    }

    const networkDetails = await getNetworkDetails();

    if (networkDetails.error) {
      assertFreighterError(
        networkDetails.error.message ?? "Unable to read Freighter network details.",
      );
    }

    const walletNetwork = networkDetails.network ?? "unknown";
    const expectedNetwork = normalizeNetworkLabel(
      clientEnv.NEXT_PUBLIC_STELLAR_NETWORK,
    );

    if (!normalizeNetworkLabel(walletNetwork).includes(expectedNetwork)) {
      assertFreighterError(
        `Freighter is connected to ${walletNetwork}. Switch to Stellar ${clientEnv.NEXT_PUBLIC_STELLAR_NETWORK}.`,
      );
    }

    return {
      network: walletNetwork,
      publicKey: access.address,
    };
  },
  async disconnect() {
    return;
  },
  async signTransaction(xdr: string, opts?: unknown) {
    const signed = await freighterSignTransaction(
      xdr,
      opts as { address?: string; networkPassphrase?: string } | undefined,
    );

    if (signed.error || !signed.signedTxXdr) {
      assertFreighterError(
        signed.error?.message ?? "Freighter transaction signing failed.",
      );
    }

    return signed.signedTxXdr;
  },
};
