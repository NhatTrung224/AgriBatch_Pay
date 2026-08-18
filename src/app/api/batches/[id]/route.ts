import { getBatchDetail } from "@/features/batches/server";
import { apiError } from "@/lib/api-error";

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
    return apiError(error, "Batch not found.");
  }
}
