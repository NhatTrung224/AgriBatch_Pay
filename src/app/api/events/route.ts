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

      let closed = false;

      // The pump runs on a timer for the life of the connection. A single failed
      // query used to escape as an unhandled rejection — and repeat every three
      // seconds — which in Node 24 takes the whole server down rather than the
      // one stream. Enqueueing after the stream closes throws for the same reason.
      const pump = async () => {
        if (closed) return;

        try {
          const items = await listEventsSince(latestSeen);
          const nextItems = [...items].reverse();

          for (const item of nextItems) {
            if (item.createdAt > latestSeen) {
              latestSeen = item.createdAt;
            }

            if (closed) return;
            controller.enqueue(encodeSse("app_event", item));
          }
        } catch (error) {
          console.error("[events] unable to read the event log", error);
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
        if (closed) return;
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 15000);

      const cleanup = () => {
        if (closed) return;
        closed = true;
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
