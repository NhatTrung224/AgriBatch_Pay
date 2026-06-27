import { addFarmerLot } from "@/features/batches/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: RouteContext<"/api/batches/[id]/lots">,
) {
  try {
    const payload = await request.json();
    const { id } = await context.params;
    const detail = await addFarmerLot(id, payload);
    return Response.json(detail);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to add farmer lot.";
    return Response.json({ error: message }, { status: 400 });
  }
}
