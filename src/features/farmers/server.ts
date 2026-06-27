import { desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { farmerLots } from "@/lib/db/schema";

export async function getFarmerPayoutBoard() {
  const [lotRows, batchRows] = await Promise.all([
    db.query.farmerLots.findMany({
      orderBy: desc(farmerLots.createdAt),
    }),
    db.query.batches.findMany(),
  ]);

  const batchMap = new Map(batchRows.map((batch) => [batch.id, batch]));

  const items = lotRows.map((lot) => ({
    batch: batchMap.get(lot.batchId) ?? null,
    lot,
  }));

  const totalExpectedPayout = items.reduce(
    (sum, item) => sum + item.lot.payoutAmount,
    0,
  );
  const paidCount = items.filter((item) => item.lot.paid).length;

  return {
    items,
    paidCount,
    totalExpectedPayout,
    unpaidCount: items.length - paidCount,
  };
}
