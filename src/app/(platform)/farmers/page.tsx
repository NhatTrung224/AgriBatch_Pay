import { FarmersPayoutBoard } from "@/features/farmers/components/farmers-payout-board";
import { getFarmerPayoutBoard } from "@/features/farmers/server";

export const dynamic = "force-dynamic";

export default async function FarmersPage() {
  const board = await getFarmerPayoutBoard();

  return <FarmersPayoutBoard board={board} />;
}
