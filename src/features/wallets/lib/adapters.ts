import { freighterAdapter } from "@/features/wallets/lib/freighter-adapter";
import { rabetAdapter } from "@/features/wallets/lib/rabet-adapter";
import type { WalletAdapter, WalletProvider } from "@/features/wallets/types";

const adapterByProvider: Record<WalletProvider, WalletAdapter> = {
  freighter: freighterAdapter,
  rabet: rabetAdapter,
};

export function getWalletAdapter(provider: WalletProvider) {
  return adapterByProvider[provider];
}
