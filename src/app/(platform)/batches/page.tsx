import { listBatches } from "@/features/batches/server";
import { BatchesDirectory } from "@/features/batches/components/batches-directory";

export const dynamic = "force-dynamic";

export default async function BatchesPage() {
  const items = await listBatches();

  return <BatchesDirectory items={items} />;
}
