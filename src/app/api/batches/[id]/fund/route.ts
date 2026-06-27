import { fundBatch } from "@/features/batches/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: RouteContext<"/api/batches/[id]/fund">,
) {
  try {
    const payload = await request.json();
    const { id } = await context.params;
    const detail = await fundBatch(id, payload);
    return Response.json(detail);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fund batch.";
    return Response.json({ error: message }, { status: 400 });
  }
}
