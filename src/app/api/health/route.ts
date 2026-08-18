import { sql } from "drizzle-orm";

import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The old handler answered "ok" unconditionally, so an instance that had lost its
 * database still reported healthy and kept receiving traffic. A health check that
 * cannot fail is not a health check.
 */
export async function GET() {
  const startedAt = Date.now();

  try {
    await db.execute(sql`select 1`);
  } catch (error) {
    console.error("[health] database unreachable", error);

    return Response.json(
      {
        database: "unreachable",
        service: "agribatch-pay",
        status: "degraded",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }

  return Response.json({
    database: "ok",
    latencyMs: Date.now() - startedAt,
    service: "agribatch-pay",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
