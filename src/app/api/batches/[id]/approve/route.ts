import { approveSettlement } from "@/features/batches/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: RouteContext<"/api/batches/[id]/approve">,
) {
  try {
    const payload = await request.json();
    const { id } = await context.params;
    const detail = await approveSettlement(id, payload);
    return Response.json(detail);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to approve settlement.";
    return Response.json({ error: message }, { status: 400 });
  }
}
