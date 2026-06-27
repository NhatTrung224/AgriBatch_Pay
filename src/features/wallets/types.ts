import type { WalletProvider } from "@/types/domain";

export type { WalletProvider };

export type WalletConnection = {
  network?: string;
  publicKey: string;
};

export type WalletAdapter = {
  connect(): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  isInstalled(): Promise<boolean>;
  provider: WalletProvider;
  signTransaction(xdr: string, opts?: unknown): Promise<string>;
};
