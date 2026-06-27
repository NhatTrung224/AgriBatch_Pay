import { listEventsSince } from "@/features/batches/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

function encodeSse(event: string, payload: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
}

export async function GET(request: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      let latestSeen = new Date(Date.now() - 1000 * 60 * 60);

      const pump = async () => {
        const items = await listEventsSince(latestSeen);
        const nextItems = [...items].reverse();

        for (const item of nextItems) {
          if (item.createdAt > latestSeen) {
            latestSeen = item.createdAt;
          }

          controller.enqueue(encodeSse("app_event", item));
        }
      };

      controller.enqueue(
        encodeSse("connected", {
          status: "ok",
          timestamp: new Date().toISOString(),
        }),
      );

      await pump();

      const eventInterval = setInterval(() => {
        void pump();
      }, 3000);
      const heartbeatInterval = setInterval(() => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 15000);

      const cleanup = () => {
        clearInterval(eventInterval);
        clearInterval(heartbeatInterval);
        controller.close();
      };

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
    },
  });
}
