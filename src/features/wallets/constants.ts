import type { WalletProvider } from "@/features/wallets/types";

export const walletOptions: Array<{
  description: string;
  label: string;
  provider: WalletProvider;
}> = [
  {
    provider: "freighter",
    label: "Freighter",
    description:
      "Official Stellar browser extension flow with network and signing support.",
  },
  {
    provider: "rabet",
    label: "Rabet",
    description:
      "Extension-based Stellar wallet for alternate buyer and cooperative signing flows.",
  },
];
