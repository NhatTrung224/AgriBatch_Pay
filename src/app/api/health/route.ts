export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    service: "agribatch-pay",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
