CREATE TYPE "public"."app_event_type" AS ENUM('batch_created', 'farmer_lot_added', 'vault_registered', 'vault_funded', 'quality_confirmed', 'settlement_approved', 'farmer_paid', 'batch_settled', 'wallet_connected', 'transaction_submitted', 'transaction_confirmed', 'transaction_failed');--> statement-breakpoint
CREATE TYPE "public"."batch_status" AS ENUM('CREATED', 'LOTS_ADDED', 'VAULT_REGISTERED', 'FUNDED', 'QUALITY_CONFIRMED', 'SETTLEMENT_APPROVED', 'SETTLED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('FARMER', 'COOPERATIVE', 'BUYER', 'AUDITOR');--> statement-breakpoint
CREATE TYPE "public"."wallet_provider" AS ENUM('freighter', 'rabet');--> statement-breakpoint
CREATE TABLE "app_events" (
	"batch_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"tx_hash" text,
	"type" "app_event_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "batches" (
	"asset_code" text NOT NULL,
	"asset_contract_address" text,
	"buyer_wallet" text NOT NULL,
	"cooperative_wallet" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"crop_type" text NOT NULL,
	"expected_payout_date" timestamp with time zone,
	"farmer_count" integer DEFAULT 0 NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"last_tx_hash" text,
	"location" text NOT NULL,
	"registry_contract_address" text,
	"season" text NOT NULL,
	"status" "batch_status" DEFAULT 'CREATED' NOT NULL,
	"total_amount" double precision DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"vault_contract_address" text
);
--> statement-breakpoint
CREATE TABLE "farmer_lots" (
	"batch_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"farmer_name" text NOT NULL,
	"farmer_wallet" text NOT NULL,
	"grade" integer NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"paid" boolean DEFAULT false NOT NULL,
	"payout_amount" double precision DEFAULT 0 NOT NULL,
	"payout_tx_hash" text,
	"price_per_kg" double precision NOT NULL,
	"weight_kg" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_evidence" (
	"ci_status" text NOT NULL,
	"contract_interaction_tx_hash" text,
	"demo_video_status" text NOT NULL,
	"github_repo_url" text NOT NULL,
	"healthcheck_status" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"live_demo_status" text NOT NULL,
	"mobile_screenshot_status" text NOT NULL,
	"payout_vault_contract_address" text,
	"railway_status" text NOT NULL,
	"readme_status" text NOT NULL,
	"registry_contract_address" text,
	"required_screenshot_checklist" jsonb NOT NULL,
	"test_output_summary" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet_interactions" (
	"action" text NOT NULL,
	"contract_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"error_message" text,
	"id" text PRIMARY KEY NOT NULL,
	"provider" "wallet_provider" NOT NULL,
	"public_key" text NOT NULL,
	"role" "user_role" NOT NULL,
	"success" boolean DEFAULT false NOT NULL,
	"tx_hash" text
);
--> statement-breakpoint
ALTER TABLE "app_events" ADD CONSTRAINT "app_events_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_lots" ADD CONSTRAINT "farmer_lots_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;