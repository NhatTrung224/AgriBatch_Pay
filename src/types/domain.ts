export const batchStatuses = [
  "CREATED",
  "LOTS_ADDED",
  "VAULT_REGISTERED",
  "FUNDED",
  "QUALITY_CONFIRMED",
  "SETTLEMENT_APPROVED",
  "SETTLED",
  "FAILED",
] as const;

export const userRoles = ["FARMER", "COOPERATIVE", "BUYER", "AUDITOR"] as const;

export const walletProviders = ["freighter", "rabet"] as const;

export const appEventTypes = [
  "batch_created",
  "farmer_lot_added",
  "vault_registered",
  "vault_funded",
  "quality_confirmed",
  "settlement_approved",
  "farmer_paid",
  "batch_settled",
  "wallet_connected",
  "transaction_submitted",
  "transaction_confirmed",
  "transaction_failed",
] as const;

export type BatchStatus = (typeof batchStatuses)[number];
export type UserRole = (typeof userRoles)[number];
export type WalletProvider = (typeof walletProviders)[number];
export type AppEventType = (typeof appEventTypes)[number];

export interface AgriBatchRecord {
  assetCode: string;
  assetContractAddress: string | null;
  buyerWallet: string;
  cooperativeWallet: string;
  createdAt: Date;
  cropType: string;
  expectedPayoutDate: Date | null;
  farmerCount: number;
  id: string;
  lastTxHash: string | null;
  location: string;
  registryContractAddress: string | null;
  season: string;
  status: BatchStatus;
  totalAmount: number;
  updatedAt: Date;
  vaultContractAddress: string | null;
}

export interface FarmerLotRecord {
  batchId: string;
  createdAt?: Date;
  farmerName: string;
  farmerWallet: string;
  grade: number;
  id: string;
  paid: boolean;
  payoutAmount: number;
  payoutTxHash: string | null;
  pricePerKg: number;
  weightKg: number;
}

export interface WalletInteractionRecord {
  action: string;
  contractAddress: string | null;
  createdAt: Date;
  errorMessage: string | null;
  id: string;
  provider: WalletProvider;
  publicKey: string;
  role: UserRole;
  success: boolean;
  txHash: string | null;
}

export interface AppEventRecord {
  batchId: string | null;
  createdAt: Date;
  id: string;
  message: string;
  metadata: Record<string, string | number | boolean | null> | null;
  txHash: string | null;
  type: AppEventType;
}
