import { approveSettlement } from "@/features/batches/server";
import { apiError } from "@/lib/api-error";

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
    return apiError(error, "Unable to approve settlement.");
  }
}
