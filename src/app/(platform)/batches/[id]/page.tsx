import { notFound } from "next/navigation";

import { BatchDetailWorkspace } from "@/features/batches/components/batch-detail-workspace";
import { getBatchDetail } from "@/features/batches/server";

export const dynamic = "force-dynamic";

export default async function BatchDetailPage(
  props: PageProps<"/batches/[id]">,
) {
  const { id } = await props.params;
  const detail = await getBatchDetail(id).catch(() => null);

  if (!detail) {
    notFound();
  }

  return <BatchDetailWorkspace detail={detail} />;
}
