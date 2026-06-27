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
const BUYER_WALLET = "GCDJS5UGG72VN5TK22JOCX7JXPTUOIQC5QQSQ7Y7ZZHMEZMCFTTMCLPI";
const COOPERATIVE_WALLET = "GAWATUMHTVY4X3H3NMD6QUDRFDRO7KMRVQ2PMPZJU6V3OLKMCXP6GDLS";
const REGISTRY_CONTRACT_ID = "CDPXGT337R4OUWSFIXCUMIRZWIGI4SK5X25UDI3DGPHJL4Y3RPENPZX3";
const PAYOUT_VAULT_CONTRACT_ID = "CASE4YOPVSPY4VRCCLVZFCQTAELJWBSPJSRQWNZXLFN4QGQBDDNQNEPB";
const SAMPLE_CONTRACT_TX_HASH = "4A50F4D6B47E0BEFAC3A7D5CDC6B5767197835E886A44DB4E3DAB72DAEB6C940";
const FARMER_WALLETS = [
  "GAV3NWIJLYG56ZVMXK6KESBOQ3E6ULAZ2YMVGFFURU7P6IK25RIK33FF",
  "GCQZDTTISV3XKR4HXH4MRXR4HPVEF3DKPIJEYLN3TY6TO4IFJTIRFVAC",
  "GB5A3NMOY5XENJ2CF2FPFCGJWDTL7UKBYUHEP6RRID6K6SSB3GN6DJK7",
] as const;

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
      farmerWallet: FARMER_WALLETS[0],
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
      farmerWallet: FARMER_WALLETS[1],
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
      farmerWallet: FARMER_WALLETS[2],
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
    buyerWallet: BUYER_WALLET,
    cooperativeWallet: COOPERATIVE_WALLET,
    cropType: "Robusta Coffee",
    expectedPayoutDate: new Date("2026-07-06T09:00:00.000Z"),
    farmerCount: seedLots.length,
    id: BATCH_ID,
    lastTxHash: SAMPLE_CONTRACT_TX_HASH,
    location: "Dak Lak, Vietnam",
    registryContractAddress: REGISTRY_CONTRACT_ID,
    season: "Monsoon 2026",
    status: "FUNDED",
    totalAmount: totals.totalPayout,
    vaultContractAddress: PAYOUT_VAULT_CONTRACT_ID,
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
      txHash: SAMPLE_CONTRACT_TX_HASH,
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
    publicKey: BUYER_WALLET,
    role: "BUYER",
    success: true,
    txHash: SAMPLE_CONTRACT_TX_HASH,
  });

  await db.insert(submissionEvidence).values({
    ciStatus: "Ready",
    contractInteractionTxHash: SAMPLE_CONTRACT_TX_HASH,
    demoVideoStatus: "Temporary placeholder -> https://agribatchpay-production.up.railway.app/",
    githubRepoUrl: "git@github-nhattrung224:NhatTrung224/AgriBatch_Pay.git",
    healthcheckStatus: "Ready",
    id: "current",
    liveDemoStatus: "https://agribatchpay-production.up.railway.app/",
    mobileScreenshotStatus: "Capture from Railway demo",
    payoutVaultContractAddress: PAYOUT_VAULT_CONTRACT_ID,
    railwayStatus: "Configured",
    readmeStatus: "Ready",
    registryContractAddress: REGISTRY_CONTRACT_ID,
    requiredScreenshotChecklist: [
      "Mobile responsive UI",
      "CI/CD running",
      "Test output with 3+ passing tests",
    ],
    testOutputSummary: "Vitest: 6 tests passed. Lint, typecheck, and build passed locally.",
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
