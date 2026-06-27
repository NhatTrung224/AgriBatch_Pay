import { listBatches, listEventsSince } from "@/features/batches/server";

export async function getDashboardSnapshot() {
  const [allBatches, recentEvents] = await Promise.all([
    listBatches(),
    listEventsSince(),
  ]);

  const fundedBatches = allBatches.filter((batch) => batch.status === "FUNDED").length;
  const settledBatches = allBatches.filter((batch) => batch.status === "SETTLED").length;
  const pendingPayouts = allBatches.filter((batch) =>
    ["LOTS_ADDED", "FUNDED", "QUALITY_CONFIRMED"].includes(batch.status),
  ).length;
  const totalVolume = allBatches.reduce((sum, batch) => sum + batch.totalAmount, 0);

  return {
    allBatches,
    fundedBatches,
    pendingPayouts,
    recentEvents: recentEvents.slice(0, 8),
    settledBatches,
    totalBatches: allBatches.length,
    totalVolume,
  };
}
