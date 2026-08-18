import { addFarmerLot } from "@/features/batches/server";
import { apiError } from "@/lib/api-error";

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
    return apiError(error, "Unable to add farmer lot.");
  }
}
