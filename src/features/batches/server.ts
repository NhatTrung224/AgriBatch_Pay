import { asc, desc, eq, gt } from "drizzle-orm";
import { ApiError } from "@/lib/api-error";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

import { calculateLotPayout, summarizeLotTotals } from "@/lib/batches/calculations";
import { db } from "@/lib/db";
import { appEvents, batches, farmerLots, submissionEvidence, walletInteractions } from "@/lib/db/schema";
import {
  addFarmerLotSchema,
  approveSettlementSchema,
  confirmQualitySchema,
  createBatchSchema,
  fundVaultSchema,
} from "@/lib/validation/batches";
import {
  canAddFarmerLot,
  canApproveSettlement,
  canConfirmQuality,
  canFundVault,
  furthestStatus,
} from "@/features/batches/workflow";
import type { AppEventType, BatchStatus } from "@/types/domain";

type CreateBatchInput = Parameters<typeof createBatchSchema.parse>[0];
type AddFarmerLotInput = Parameters<typeof addFarmerLotSchema.parse>[0];
type ConfirmQualityInput = Parameters<typeof confirmQualitySchema.parse>[0];
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
  const [lots, batch] = await Promise.all([
    db.query.farmerLots.findMany({ where: eq(farmerLots.batchId, batchId) }),
    db.query.batches.findFirst({ where: eq(batches.id, batchId) }),
  ]);
  const totals = summarizeLotTotals(lots);
  const proposed = status ?? (lots.length ? "LOTS_ADDED" : "CREATED");

  await db.update(batches).set({
    farmerCount: lots.length,
    status: batch ? furthestStatus(batch.status, proposed) : proposed,
    totalAmount: totals.totalPayout,
    updatedAt: now(),
  }).where(eq(batches.id, batchId));

  return totals;
}

/** The directory is a page, not an export. */
const BATCH_PAGE_SIZE = 200;
/** A batch accrues history without limit; the detail page shows the recent part. */
const BATCH_HISTORY_SIZE = 200;
/** Each poll of the live stream, and every reconnect, reads this much at most. */
const EVENT_POLL_SIZE = 100;

export async function listBatches() {
  return db.query.batches.findMany({
    limit: BATCH_PAGE_SIZE,
    orderBy: desc(batches.updatedAt),
  });
}

export async function listEventsSince(since?: Date) {
  const [contractEvents, walletEventRows] = await Promise.all([
    // Polled every three seconds per open stream, so each read is capped. The
    // order has to be oldest-first: taking the newest N and then advancing the
    // watermark past them would skip everything older in the same window, and
    // those events would never be delivered.
    db.query.appEvents.findMany({
      limit: EVENT_POLL_SIZE,
      orderBy: since ? asc(appEvents.createdAt) : desc(appEvents.createdAt),
      where: since ? gt(appEvents.createdAt, since) : undefined,
    }),
    db.query.walletInteractions.findMany({
      limit: EVENT_POLL_SIZE,
      orderBy: since ? asc(walletInteractions.createdAt) : desc(walletInteractions.createdAt),
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
      limit: BATCH_HISTORY_SIZE,
      orderBy: desc(farmerLots.createdAt),
      where: eq(farmerLots.batchId, batchId),
    }),
    db.query.appEvents.findMany({
      limit: BATCH_HISTORY_SIZE,
      orderBy: desc(appEvents.createdAt),
      where: eq(appEvents.batchId, batchId),
    }),
  ]);

  if (!batch) {
    throw new ApiError(`Batch ${batchId} was not found.`, 404);
  }

  return { batch, events, lots };
}

/**
 * Both ids may be supplied by the caller, so a clash is an ordinary thing to say
 * back — not an unexplained 500 from a primary key violation deep in the driver.
 */
function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

export async function createBatch(input: CreateBatchInput) {
  const parsed = createBatchSchema.parse(input);
  const batchId = parsed.batchId || `BATCH-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`;

  try {
    await db.insert(batches).values({
      assetCode: parsed.assetCode,
      assetContractAddress: parsed.assetContractAddress || null,
      buyerWallet: parsed.buyerWallet,
      cooperativeWallet: parsed.cooperativeWallet,
      cropType: parsed.cropType,
      expectedPayoutDate: parsed.expectedPayoutDate ? new Date(parsed.expectedPayoutDate) : null,
      farmerCount: 0,
      id: batchId,
      lastTxHash: parsed.txHash || null,
      location: parsed.location,
      registryContractAddress: parsed.registryContractAddress || null,
      season: parsed.season,
      status: "CREATED",
      totalAmount: 0,
      updatedAt: now(),
      vaultContractAddress: parsed.vaultContractAddress || null,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ApiError(`Batch ${batchId} already exists.`, 409);
    }

    throw error;
  }

  if (parsed.provider && parsed.txHash) {
    await logWalletInteraction({
      action: "create_batch",
      contractAddress: parsed.registryContractAddress || null,
      provider: parsed.provider,
      publicKey: parsed.cooperativeWallet,
      role: "COOPERATIVE",
      success: true,
      txHash: parsed.txHash,
    });
  }

  await appendEvent({
    batchId,
    message: `Crop batch ${batchId} created for ${parsed.cropType}.`,
    metadata: {
      buyerWallet: parsed.buyerWallet,
      cropType: parsed.cropType,
      registryContractAddress: parsed.registryContractAddress || null,
      season: parsed.season,
      vaultContractAddress: parsed.vaultContractAddress || null,
    },
    txHash: parsed.txHash || null,
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
    throw new ApiError(`Batch ${batchId} was not found.`, 404);
  }

  if (!canAddFarmerLot(batch.status)) {
    throw new ApiError(
      "Farmer lots close once the vault is funded or quality is confirmed.",
    );
  }

  const payoutAmount = calculateLotPayout(
    parsed.weightKg,
    parsed.pricePerKg,
    parsed.grade,
  );

  try {
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
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ApiError("A farmer lot with that id already exists.", 409);
    }

    throw error;
  }

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

export async function confirmBatchQuality(batchId: string, input?: ConfirmQualityInput) {
  const parsed = confirmQualitySchema.parse(input ?? {});
  const batch = await db.query.batches.findFirst({
    where: eq(batches.id, batchId),
  });

  if (!batch) {
    throw new ApiError(`Batch ${batchId} was not found.`, 404);
  }

  const lots = await db.query.farmerLots.findMany({
    where: eq(farmerLots.batchId, batchId),
  });

  // Funding and settlement both refuse a wallet that is not the one on the batch;
  // quality confirmation did not, even though it is the gate those two wait on.
  if (parsed.publicKey && batch.cooperativeWallet !== parsed.publicKey) {
    throw new ApiError("Quality must be confirmed by the cooperative wallet on the batch.");
  }

  if (!canConfirmQuality({ hasLots: lots.length > 0, status: batch.status })) {
    throw new ApiError(
      lots.length
        ? "Batch quality is already confirmed or the batch is settled."
        : "Cannot confirm quality before at least one farmer lot exists.",
    );
  }

  await db.update(batches).set({
    lastTxHash: parsed.txHash || batch.lastTxHash,
    status: "QUALITY_CONFIRMED",
    updatedAt: now(),
  }).where(eq(batches.id, batchId));

  if (parsed.provider && parsed.publicKey) {
    await logWalletInteraction({
      action: "confirm_quality",
      contractAddress: batch.registryContractAddress,
      provider: parsed.provider,
      publicKey: parsed.publicKey,
      role: "AUDITOR",
      success: true,
      txHash: parsed.txHash || null,
    });
  }

  await appendEvent({
    batchId,
    message: `Quality confirmed for batch ${batchId}.`,
    metadata: {
      publicKey: parsed.publicKey || null,
      status: "QUALITY_CONFIRMED",
    },
    txHash: parsed.txHash || null,
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
    throw new ApiError(`Batch ${batchId} was not found.`, 404);
  }

  if (!canFundVault({ status: batch.status, totalAmount: batch.totalAmount })) {
    throw new ApiError(
      batch.totalAmount <= 0
        ? "Batch total payout must be greater than zero before funding."
        : "Batch is already funded or settled.",
    );
  }

  if (batch.buyerWallet !== parsed.publicKey) {
    throw new ApiError("Funding wallet must match the buyer wallet configured on the batch.");
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
    throw new ApiError("Settlement approval must be signed by the configured buyer wallet.");
  }

  if (!canApproveSettlement({
    hasLots: detail.lots.length > 0,
    hasQualityConfirmation,
    hasVaultFunding,
    status: detail.batch.status,
    totalAmount: detail.batch.totalAmount,
  })) {
    throw new ApiError("Batch must have lots, funding, and quality confirmation before settlement.");
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
