"use client";

import { ActivityIcon, ArrowsClockwise, Broadcast } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { TransactionHashLink } from "@/components/transaction-hash-link";
import { formatRelativeDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type StreamEvent = {
  createdAt: string;
  id: string;
  kind: "app" | "wallet";
  label: string;
  message: string;
  txHash: string | null;
};

export function EventsStreamPanel() {
  const reconnectAttempts = useRef(0);
  const [connectionState, setConnectionState] = useState<
    "connecting" | "error" | "live" | "reconnecting"
  >("connecting");
  const [events, setEvents] = useState<Array<StreamEvent>>([]);
  const [latestEventAt, setLatestEventAt] = useState<string | null>(null);

  useEffect(() => {
    let activeSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let isDisposed = false;

    const connect = () => {
      if (isDisposed) {
        return;
      }

      setConnectionState(reconnectAttempts.current ? "reconnecting" : "connecting");
      const source = new EventSource("/api/events");
      activeSource = source;

      source.addEventListener("connected", () => {
        reconnectAttempts.current = 0;
        setConnectionState("live");
      });

      source.addEventListener("app_event", (event) => {
        const payload = JSON.parse(event.data) as StreamEvent;

        reconnectAttempts.current = 0;
        setConnectionState("live");
        setLatestEventAt(payload.createdAt);
        setEvents((current) => {
          if (current.some((item) => item.id === payload.id && item.kind === payload.kind)) {
            return current;
          }

          return [payload, ...current].slice(0, 40);
        });
      });

      source.onerror = () => {
        source.close();
        reconnectAttempts.current += 1;
        setConnectionState(reconnectAttempts.current >= 3 ? "error" : "reconnecting");

        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      isDisposed = true;
      activeSource?.close();
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, []);

  const statusTone = {
    connecting: "border-white/12 bg-white/6 text-slate-200",
    error: "border-rose-300/20 bg-rose-300/10 text-rose-100",
    live: "border-emerald-200/18 bg-emerald-300/10 text-emerald-100",
    reconnecting: "border-amber-300/18 bg-amber-300/10 text-amber-100",
  } as const;

  return (
    <div className="space-y-4">
      <section className="panel px-5 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-slate-300">
              Event stream
            </span>
            <h1 className="mt-4 font-display text-[3rem] tracking-[-0.06em] text-white">
              Realtime contract and wallet activity without page refresh.
            </h1>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em]",
              statusTone[connectionState],
            )}
          >
            <ActivityIcon size={14} weight="fill" />
            {connectionState}
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <MetricPill
            label="Connection"
            value={
              connectionState === "live"
                ? "SSE stream active"
                : connectionState === "error"
                  ? "Reconnect required"
                  : "Negotiating stream"
            }
          />
          <MetricPill
            label="Latest event"
            value={latestEventAt ? formatRelativeDate(new Date(latestEventAt)) : "Waiting"}
          />
          <MetricPill
            label="Buffered items"
            value={`${events.length} retained`}
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.76fr_1.24fr]">
        <article className="panel px-5 py-6 lg:px-8">
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
            Stream notes
          </p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-400">
            <p>
              The page subscribes to <code>/api/events</code> and keeps the most
              recent 40 app and wallet events in memory.
            </p>
            <p>
              Initial events are replayed from the application audit log, then
              the client keeps reconnecting every 3 seconds if the stream drops.
            </p>
            <p>
              When the state reaches <code>error</code>, the retry loop is still
              running and the badge will return to <code>live</code> as soon as
              the endpoint responds again.
            </p>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/3 px-4 py-5">
            <div className="flex items-center gap-3">
              <ArrowsClockwise size={18} className="text-cyan-100" />
              <p className="text-sm font-medium text-white">Reconnect behavior</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Browser disconnects, local server restarts, or temporary network
              issues move the feed into a reconnecting loop instead of crashing
              the page.
            </p>
          </div>
        </article>

        <article className="panel px-5 py-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
                Activity timeline
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-[-0.05em] text-white">
                Unified app and wallet log
              </h2>
            </div>
            <span className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100">
              {events.length ? "Streaming" : "Waiting"}
            </span>
          </div>

          {!events.length ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-white/12 bg-white/3 px-6 py-10 text-center">
              <Broadcast size={24} className="mx-auto text-cyan-100" />
              <p className="mt-4 font-display text-2xl tracking-[-0.04em] text-white">
                Listening for the first event.
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Start a batch action from the dashboard or batch detail page and
                the timeline will populate automatically.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {events.map((event) => (
                <article
                  key={`${event.kind}-${event.id}`}
                  className="rounded-[20px] border border-white/10 bg-white/3 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{event.label}</span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-1 text-[0.65rem] uppercase tracking-[0.18em]",
                            event.kind === "wallet"
                              ? "border-cyan-300/18 bg-cyan-300/10 text-cyan-100"
                              : "border-emerald-200/18 bg-emerald-300/10 text-emerald-100",
                          )}
                        >
                          {event.kind}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{event.message}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {formatRelativeDate(new Date(event.createdAt))}
                    </span>
                  </div>
                  {event.txHash ? (
                    <TransactionHashLink
                      value={event.txHash}
                      className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-100"
                    />
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/3 px-4 py-4">
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-sm font-medium text-white">{value}</p>
    </article>
  );
}
