import { confirmBatchQuality } from "@/features/batches/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: RouteContext<"/api/batches/[id]/quality">,
) {
  try {
    const { id } = await context.params;
    const detail = await confirmBatchQuality(id);
    return Response.json(detail);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to confirm quality.";
    return Response.json({ error: message }, { status: 400 });
  }
}
