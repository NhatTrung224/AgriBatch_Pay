import { createBatch, listBatches } from "@/features/batches/server";
import { apiError } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await listBatches();
  return Response.json({ items });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const batch = await createBatch(payload);
    return Response.json(batch, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create batch.");
  }
}
