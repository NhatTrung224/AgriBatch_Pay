import { desc, eq, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

import { calculateLotPayout, summarizeLotTotals } from "@/lib/batches/calculations";
import { db } from "@/lib/db";
import { appEvents, batches, farmerLots, submissionEvidence, walletInteractions } from "@/lib/db/schema";
import { createBatchSchema, fundVaultSchema, addFarmerLotSchema, approveSettlementSchema } from "@/lib/validation/batches";
import { canAddFarmerLot, canApproveSettlement, canConfirmQuality, canFundVault } from "@/features/batches/workflow";
import type { AppEventType, BatchStatus } from "@/types/domain";

type CreateBatchInput = Parameters<typeof createBatchSchema.parse>[0];
type AddFarmerLotInput = Parameters<typeof addFarmerLotSchema.parse>[0];
type FundVaultInput = Parameters<typeof fundVaultSchema.parse>[0];
type ApproveSettlementInput = Parameters<typeof approveSettlementSchema.parse>[0];

function now() {
  return new Date();
}

async function appendEvent(args: {
  batchId?: string | null;
  message: string;
  metadata?: Record<string, string | number | boolean | null>;
  txHash?: string | null;
  type: AppEventType;
}) {
  await db.insert(appEvents).values({
    batchId: args.batchId ?? null,
    createdAt: now(),
    id: nanoid(12),
    message: args.message,
    metadata: args.metadata,
    txHash: args.txHash ?? null,
    type: args.type,
  });
}

async function logWalletInteraction(args: {
  action: string;
  contractAddress?: string | null;
  errorMessage?: string | null;
  provider: "freighter" | "rabet";
  publicKey: string;
  role: "BUYER" | "COOPERATIVE" | "FARMER" | "AUDITOR";
  success: boolean;
  txHash?: string | null;
}) {
  await db.insert(walletInteractions).values({
    action: args.action,
    contractAddress: args.contractAddress ?? null,
    createdAt: now(),
    errorMessage: args.errorMessage ?? null,
    id: nanoid(12),
    provider: args.provider,
    publicKey: args.publicKey,
    role: args.role,
    success: args.success,
    txHash: args.txHash ?? null,
  });
}

async function recalculateBatch(batchId: string, status?: BatchStatus) {
  const lots = await db.query.farmerLots.findMany({
    where: eq(farmerLots.batchId, batchId),
  });
  const totals = summarizeLotTotals(lots);

  await db.update(batches).set({
    farmerCount: lots.length,
    status: status ?? (lots.length ? "LOTS_ADDED" : "CREATED"),
    totalAmount: totals.totalPayout,
    updatedAt: now(),
  }).where(eq(batches.id, batchId));

  return totals;
}

export async function listBatches() {
  return db.query.batches.findMany({
    orderBy: desc(batches.updatedAt),
  });
}

export async function listEventsSince(since?: Date) {
  const [contractEvents, walletEventRows] = await Promise.all([
    db.query.appEvents.findMany({
      orderBy: desc(appEvents.createdAt),
      where: since ? gt(appEvents.createdAt, since) : undefined,
    }),
    db.query.walletInteractions.findMany({
      orderBy: desc(walletInteractions.createdAt),
      where: since ? gt(walletInteractions.createdAt, since) : undefined,
    }),
  ]);

  const combined = [
    ...contractEvents.map((event) => ({
      createdAt: event.createdAt,
      id: event.id,
      kind: "app",
      label: event.type,
      message: event.message,
      txHash: event.txHash,
    })),
    ...walletEventRows.map((event) => ({
      createdAt: event.createdAt,
      id: event.id,
      kind: "wallet",
      label: event.action,
      message: `${event.provider} ${event.success ? "completed" : "failed"} for ${event.role}`,
      txHash: event.txHash,
    })),
  ];

  return combined.sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
  );
}

export async function getBatchDetail(batchId: string) {
  const [batch, lots, events] = await Promise.all([
    db.query.batches.findFirst({
      where: eq(batches.id, batchId),
    }),
    db.query.farmerLots.findMany({
      orderBy: desc(farmerLots.createdAt),
      where: eq(farmerLots.batchId, batchId),
    }),
    db.query.appEvents.findMany({
      orderBy: desc(appEvents.createdAt),
      where: eq(appEvents.batchId, batchId),
    }),
  ]);

  if (!batch) {
    throw new Error(`Batch ${batchId} was not found.`);
  }

  return { batch, events, lots };
}

export async function createBatch(input: CreateBatchInput) {
  const parsed = createBatchSchema.parse(input);
  const batchId = parsed.batchId || `BATCH-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`;

  await db.insert(batches).values({
    assetCode: parsed.assetCode,
    assetContractAddress: parsed.assetContractAddress || null,
    buyerWallet: parsed.buyerWallet,
    cooperativeWallet: parsed.cooperativeWallet,
    cropType: parsed.cropType,
    expectedPayoutDate: parsed.expectedPayoutDate ? new Date(parsed.expectedPayoutDate) : null,
    farmerCount: 0,
    id: batchId,
    lastTxHash: null,
    location: parsed.location,
    registryContractAddress: null,
    season: parsed.season,
    status: "CREATED",
    totalAmount: 0,
    updatedAt: now(),
    vaultContractAddress: null,
  });

  await appendEvent({
    batchId,
    message: `Crop batch ${batchId} created for ${parsed.cropType}.`,
    metadata: {
      buyerWallet: parsed.buyerWallet,
      cropType: parsed.cropType,
      season: parsed.season,
    },
    type: "batch_created",
  });

  revalidatePath("/dashboard");
  revalidatePath("/batches");

  return getBatchDetail(batchId);
}

export async function addFarmerLot(batchId: string, input: AddFarmerLotInput) {
  const parsed = addFarmerLotSchema.parse(input);
  const batch = await db.query.batches.findFirst({
    where: eq(batches.id, batchId),
  });

  if (!batch) {
    throw new Error(`Batch ${batchId} was not found.`);
  }

  if (!canAddFarmerLot(batch.status)) {
    throw new Error("Cannot add a farmer lot after the batch is settled.");
  }

  const payoutAmount = calculateLotPayout(
    parsed.weightKg,
    parsed.pricePerKg,
    parsed.grade,
  );

  await db.insert(farmerLots).values({
    batchId,
    farmerName: parsed.farmerName,
    farmerWallet: parsed.farmerWallet,
    grade: parsed.grade,
    id: parsed.lotId || nanoid(12),
    paid: false,
    payoutAmount,
    payoutTxHash: null,
    pricePerKg: parsed.pricePerKg,
    weightKg: parsed.weightKg,
  });

  await recalculateBatch(batchId, "LOTS_ADDED");
  await appendEvent({
    batchId,
    message: `Added farmer lot for ${parsed.farmerName}.`,
    metadata: {
      farmerWallet: parsed.farmerWallet,
      payoutAmount,
      weightKg: parsed.weightKg,
    },
    type: "farmer_lot_added",
  });

  revalidatePath("/dashboard");
  revalidatePath("/batches");
  revalidatePath(`/batches/${batchId}`);

  return getBatchDetail(batchId);
}

export async function confirmBatchQuality(batchId: string) {
  const batch = await db.query.batches.findFirst({
    where: eq(batches.id, batchId),
  });

  if (!batch) {
    throw new Error(`Batch ${batchId} was not found.`);
  }

  const lots = await db.query.farmerLots.findMany({
    where: eq(farmerLots.batchId, batchId),
  });

  if (!canConfirmQuality({ hasLots: lots.length > 0, status: batch.status })) {
    throw new Error(
      lots.length
        ? "Batch quality is already confirmed or the batch is settled."
        : "Cannot confirm quality before at least one farmer lot exists.",
    );
  }

  await db.update(batches).set({
    status: "QUALITY_CONFIRMED",
    updatedAt: now(),
  }).where(eq(batches.id, batchId));

  await appendEvent({
    batchId,
    message: `Quality confirmed for batch ${batchId}.`,
    metadata: { status: "QUALITY_CONFIRMED" },
    type: "quality_confirmed",
  });

  revalidatePath("/dashboard");
  revalidatePath(`/batches/${batchId}`);

  return getBatchDetail(batchId);
}

export async function fundBatch(batchId: string, input: FundVaultInput) {
  const parsed = fundVaultSchema.parse(input);
  const batch = await db.query.batches.findFirst({
    where: eq(batches.id, batchId),
  });

  if (!batch) {
    throw new Error(`Batch ${batchId} was not found.`);
  }

  if (!canFundVault({ status: batch.status, totalAmount: batch.totalAmount })) {
    throw new Error(
      batch.totalAmount <= 0
        ? "Batch total payout must be greater than zero before funding."
        : "Batch is already funded or settled.",
    );
  }

  if (batch.buyerWallet !== parsed.publicKey) {
    throw new Error("Funding wallet must match the buyer wallet configured on the batch.");
  }

  await db.update(batches).set({
    lastTxHash: parsed.txHash || batch.lastTxHash,
    status: "FUNDED",
    updatedAt: now(),
  }).where(eq(batches.id, batchId));

  await logWalletInteraction({
    action: "fund_vault",
    provider: parsed.provider,
    publicKey: parsed.publicKey,
    role: "BUYER",
    success: true,
    txHash: parsed.txHash ?? null,
  });

  await appendEvent({
    batchId,
    message: `Buyer funded the payout vault for ${batchId}.`,
    metadata: {
      provider: parsed.provider,
      publicKey: parsed.publicKey,
    },
    txHash: parsed.txHash ?? null,
    type: "vault_funded",
  });

  revalidatePath("/dashboard");
  revalidatePath(`/batches/${batchId}`);

  return getBatchDetail(batchId);
}

export async function approveSettlement(batchId: string, input: ApproveSettlementInput) {
  const parsed = approveSettlementSchema.parse(input);
  const detail = await getBatchDetail(batchId);
  const hasVaultFunding = detail.events.some((event) => event.type === "vault_funded");
  const hasQualityConfirmation = detail.events.some(
    (event) => event.type === "quality_confirmed",
  );

  if (detail.batch.buyerWallet !== parsed.publicKey) {
    throw new Error("Settlement approval must be signed by the configured buyer wallet.");
  }

  if (!canApproveSettlement({
    hasLots: detail.lots.length > 0,
    hasQualityConfirmation,
    hasVaultFunding,
    status: detail.batch.status,
    totalAmount: detail.batch.totalAmount,
  })) {
    throw new Error("Batch must have lots, funding, and quality confirmation before settlement.");
  }

  await db.update(batches).set({
    lastTxHash: parsed.txHash || detail.batch.lastTxHash,
    status: "SETTLED",
    updatedAt: now(),
  }).where(eq(batches.id, batchId));

  await db.update(farmerLots).set({
    paid: true,
    payoutTxHash: parsed.txHash || null,
  }).where(eq(farmerLots.batchId, batchId));

  await logWalletInteraction({
    action: "approve_settlement",
    provider: parsed.provider,
    publicKey: parsed.publicKey,
    role: "BUYER",
    success: true,
    txHash: parsed.txHash ?? null,
  });

  await appendEvent({
    batchId,
    message: `Settlement approved for ${batchId}.`,
    metadata: { provider: parsed.provider },
    txHash: parsed.txHash ?? null,
    type: "settlement_approved",
  });

  for (const lot of detail.lots) {
    await appendEvent({
      batchId,
      message: `Farmer payout marked paid for ${lot.farmerName}.`,
      metadata: {
        farmerWallet: lot.farmerWallet,
        payoutAmount: lot.payoutAmount,
      },
      txHash: parsed.txHash ?? null,
      type: "farmer_paid",
    });
  }

  await appendEvent({
    batchId,
    message: `Batch ${batchId} marked settled.`,
    metadata: { status: "SETTLED" },
    txHash: parsed.txHash ?? null,
    type: "batch_settled",
  });

  await db.update(submissionEvidence).set({
    contractInteractionTxHash: parsed.txHash ?? null,
  }).where(eq(submissionEvidence.id, "current"));

  revalidatePath("/dashboard");
  revalidatePath("/batches");
  revalidatePath(`/batches/${batchId}`);
  revalidatePath("/submission");

  return getBatchDetail(batchId);
}
