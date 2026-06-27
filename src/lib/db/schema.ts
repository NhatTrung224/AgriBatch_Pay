import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { appEventTypes, batchStatuses, userRoles, walletProviders } from "@/types/domain";

export const batchStatusEnum = pgEnum("batch_status", batchStatuses);
export const userRoleEnum = pgEnum("user_role", userRoles);
export const walletProviderEnum = pgEnum("wallet_provider", walletProviders);
export const appEventTypeEnum = pgEnum("app_event_type", appEventTypes);

export const batches = pgTable("batches", {
  assetCode: text("asset_code").notNull(),
  assetContractAddress: text("asset_contract_address"),
  buyerWallet: text("buyer_wallet").notNull(),
  cooperativeWallet: text("cooperative_wallet").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  cropType: text("crop_type").notNull(),
  expectedPayoutDate: timestamp("expected_payout_date", {
    withTimezone: true,
  }),
  farmerCount: integer("farmer_count").default(0).notNull(),
  id: text("id").primaryKey(),
  lastTxHash: text("last_tx_hash"),
  location: text("location").notNull(),
  registryContractAddress: text("registry_contract_address"),
  season: text("season").notNull(),
  status: batchStatusEnum("status").notNull().default("CREATED"),
  totalAmount: doublePrecision("total_amount").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  vaultContractAddress: text("vault_contract_address"),
});

export const farmerLots = pgTable("farmer_lots", {
  batchId: text("batch_id")
    .notNull()
    .references(() => batches.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  farmerName: text("farmer_name").notNull(),
  farmerWallet: text("farmer_wallet").notNull(),
  grade: integer("grade").notNull(),
  id: text("id").primaryKey(),
  paid: boolean("paid").default(false).notNull(),
  payoutAmount: doublePrecision("payout_amount").default(0).notNull(),
  payoutTxHash: text("payout_tx_hash"),
  pricePerKg: doublePrecision("price_per_kg").notNull(),
  weightKg: doublePrecision("weight_kg").notNull(),
});

export const walletInteractions = pgTable("wallet_interactions", {
  action: text("action").notNull(),
  contractAddress: text("contract_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  errorMessage: text("error_message"),
  id: text("id").primaryKey(),
  provider: walletProviderEnum("provider").notNull(),
  publicKey: text("public_key").notNull(),
  role: userRoleEnum("role").notNull(),
  success: boolean("success").default(false).notNull(),
  txHash: text("tx_hash"),
});

export const appEvents = pgTable("app_events", {
  batchId: text("batch_id").references(() => batches.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  id: text("id").primaryKey(),
  message: text("message").notNull(),
  metadata: jsonb("metadata").$type<Record<string, string | number | boolean | null>>(),
  txHash: text("tx_hash"),
  type: appEventTypeEnum("type").notNull(),
});

export const submissionEvidence = pgTable("submission_evidence", {
  ciStatus: text("ci_status").notNull(),
  contractInteractionTxHash: text("contract_interaction_tx_hash"),
  demoVideoStatus: text("demo_video_status").notNull(),
  githubRepoUrl: text("github_repo_url").notNull(),
  healthcheckStatus: text("healthcheck_status").notNull(),
  id: text("id").primaryKey(),
  liveDemoStatus: text("live_demo_status").notNull(),
  mobileScreenshotStatus: text("mobile_screenshot_status").notNull(),
  payoutVaultContractAddress: text("payout_vault_contract_address"),
  railwayStatus: text("railway_status").notNull(),
  readmeStatus: text("readme_status").notNull(),
  registryContractAddress: text("registry_contract_address"),
  requiredScreenshotChecklist: jsonb("required_screenshot_checklist")
    .$type<string[]>()
    .notNull(),
  testOutputSummary: text("test_output_summary").notNull(),
});

export type BatchInsert = typeof batches.$inferInsert;
export type BatchSelect = typeof batches.$inferSelect;
export type FarmerLotInsert = typeof farmerLots.$inferInsert;
export type FarmerLotSelect = typeof farmerLots.$inferSelect;
export type WalletInteractionSelect = typeof walletInteractions.$inferSelect;
export type AppEventSelect = typeof appEvents.$inferSelect;
export type SubmissionEvidenceSelect = typeof submissionEvidence.$inferSelect;
