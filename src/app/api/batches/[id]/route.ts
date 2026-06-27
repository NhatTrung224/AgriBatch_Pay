import { getBatchDetail } from "@/features/batches/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/batches/[id]">,
) {
  try {
    const { id } = await context.params;
    const detail = await getBatchDetail(id);
    return Response.json(detail);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Batch not found.";
    return Response.json({ error: message }, { status: 404 });
  }
}
