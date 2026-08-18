import { confirmBatchQuality } from "@/features/batches/server";
import { apiError } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: RouteContext<"/api/batches/[id]/quality">,
) {
  try {
    let payload: Record<string, unknown> | undefined;

    if (request.headers.get("content-length") !== "0") {
      payload = (await request.json().catch(() => undefined)) as
        | Record<string, unknown>
        | undefined;
    }

    const { id } = await context.params;
    const detail = await confirmBatchQuality(id, payload);
    return Response.json(detail);
  } catch (error) {
    return apiError(error, "Unable to confirm quality.");
  }
}
