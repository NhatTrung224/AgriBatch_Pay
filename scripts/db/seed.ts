import "dotenv/config";

import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { calculateLotPayout, summarizeLotTotals } from "@/lib/batches/calculations";
import { db, sql } from "@/lib/db";
import {
  appEvents,
  batches,
  farmerLots,
  submissionEvidence,
  walletInteractions,
} from "@/lib/db/schema";
import type { AppEventType } from "@/types/domain";

const BATCH_ID = "BATCH-2026-0042";

async function main() {
  const existingBatch = await db.query.batches.findFirst({
    where: eq(batches.id, BATCH_ID),
  });

  if (existingBatch) {
    console.info("Seed data already exists, skipping.");
    await sql.end({ timeout: 5 });
    return;
  }

  const seedLots = [
    {
      batchId: BATCH_ID,
      farmerName: "Nguyen Van Loc",
      farmerWallet: "GBYLOC4EXAMPLEWALLETTESTNET11111111111111111111111111",
      grade: 1,
      id: nanoid(12),
      paid: false,
      payoutTxHash: null,
      pricePerKg: 9.2,
      weightKg: 1280,
    },
    {
      batchId: BATCH_ID,
      farmerName: "Tran Thi Mai",
      farmerWallet: "GBYMAI4EXAMPLEWALLETTESTNET22222222222222222222222222",
      grade: 2,
      id: nanoid(12),
      paid: false,
      payoutTxHash: null,
      pricePerKg: 9.5,
      weightKg: 960,
    },
    {
      batchId: BATCH_ID,
      farmerName: "Le Quoc Phuong",
      farmerWallet: "GBYPHUONGEXAMPLEWALLETTESTNET3333333333333333333333333",
      grade: 3,
      id: nanoid(12),
      paid: false,
      payoutTxHash: null,
      pricePerKg: 9.85,
      weightKg: 1420,
    },
  ].map((lot) => ({
    ...lot,
    payoutAmount: calculateLotPayout(lot.weightKg, lot.pricePerKg, lot.grade),
  }));

  const totals = summarizeLotTotals(seedLots);

  await db.insert(batches).values({
    assetCode: "USDC",
    assetContractAddress: null,
    buyerWallet: "GBUYERTESTNETEXAMPLEPUBLICKEY111111111111111111111111111",
    cooperativeWallet:
      "GCOOPTESTNETEXAMPLEPUBLICKEY11111111111111111111111111111",
    cropType: "Robusta Coffee",
    expectedPayoutDate: new Date("2026-07-06T09:00:00.000Z"),
    farmerCount: seedLots.length,
    id: BATCH_ID,
    lastTxHash: null,
    location: "Dak Lak, Vietnam",
    registryContractAddress: null,
    season: "Monsoon 2026",
    status: "FUNDED",
    totalAmount: totals.totalPayout,
    vaultContractAddress: null,
  });

  await db.insert(farmerLots).values(seedLots);

  const seedEvents: Array<{
    batchId: string;
    message: string;
    metadata: Record<string, string | number>;
    type: AppEventType;
  }> = [
    {
      batchId: BATCH_ID,
      message: "Crop batch created for Dak Lak coffee settlement.",
      metadata: { season: "Monsoon 2026" },
      type: "batch_created",
    },
    {
      batchId: BATCH_ID,
      message: "Three farmer lots were attached to the batch.",
      metadata: { farmerCount: seedLots.length },
      type: "farmer_lot_added",
    },
    {
      batchId: BATCH_ID,
      message: "Buyer funded the payout vault on Stellar testnet.",
      metadata: { fundedAmount: totals.totalPayout },
      type: "vault_funded",
    },
  ];

  await db.insert(appEvents).values(
    seedEvents.map((event, index) => ({
      batchId: event.batchId,
      createdAt: new Date(Date.now() - (seedEvents.length - index) * 60_000),
      id: nanoid(12),
      message: event.message,
      metadata: event.metadata,
      txHash: null,
      type: event.type,
    })),
  );

  await db.insert(walletInteractions).values({
    action: "connect_wallet",
    contractAddress: null,
    createdAt: new Date(Date.now() - 45_000),
    errorMessage: null,
    id: nanoid(12),
    provider: "freighter",
    publicKey: "GBUYERTESTNETEXAMPLEPUBLICKEY111111111111111111111111111",
    role: "BUYER",
    success: true,
    txHash: null,
  });

  await db.insert(submissionEvidence).values({
    ciStatus: "Pending",
    contractInteractionTxHash: null,
    demoVideoStatus: "Pending",
    githubRepoUrl: "git@github-nhattrung224:NhatTrung224/AgriBatch_Pay.git",
    healthcheckStatus: "Ready",
    id: "current",
    liveDemoStatus: "Pending",
    mobileScreenshotStatus: "Pending",
    payoutVaultContractAddress: null,
    railwayStatus: "Configured",
    readmeStatus: "In Progress",
    registryContractAddress: null,
    requiredScreenshotChecklist: [
      "Mobile responsive UI",
      "CI/CD running",
      "Test output with 3+ passing tests",
    ],
    testOutputSummary: "Pending",
  });

  const latestEvents = await db.query.appEvents.findMany({
    limit: 3,
    orderBy: desc(appEvents.createdAt),
  });

  console.info(
    `Seeded batch ${BATCH_ID} with ${seedLots.length} lots and ${latestEvents.length} events.`,
  );
  await sql.end({ timeout: 5 });
}

main().catch(async (error) => {
  console.error("Database seed failed.", error);
  await sql.end({ timeout: 5 });
  process.exit(1);
});
