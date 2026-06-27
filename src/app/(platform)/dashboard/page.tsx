import { ArrowSquareOut, Broadcast, Coins, CubeTransparent } from "@phosphor-icons/react/dist/ssr";

import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { formatDisplayAmount, formatRelativeDate } from "@/lib/formatters";
import { getDashboardSnapshot } from "@/features/dashboard/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <div className="space-y-8">
      <section className="panel overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(109,229,255,0.8),transparent)]" />
        <div className="grid gap-8 px-5 py-6 lg:grid-cols-[1.3fr_0.7fr] lg:px-8 lg:py-8">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-cyan-200/90">
              Platform Shell Preview
            </span>
            <div className="space-y-3">
              <h1 className="max-w-3xl font-display text-4xl tracking-[-0.05em] text-white lg:text-6xl">
                Operating center for crop batches, payout vaults, and realtime
                settlement evidence.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 lg:text-base">
                Live metrics and recent activity come directly from Neon, while
                wallet-backed Soroban actions are already wired into onboarding,
                batch creation, quality confirmation, vault funding, and
                settlement approval flows.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/onboarding" variant="ghost">
                Connect Wallet
              </ButtonLink>
              <ButtonLink href="/batches/new" variant="primary">
                Create Crop Batch
              </ButtonLink>
              <ButtonLink href="/submission" variant="ghost">
                Submission Surface
              </ButtonLink>
            </div>
          </div>
          <div className="grid gap-4">
            <MetricCard
              label="Total batches"
              value={String(snapshot.totalBatches)}
              detail="Current batch records tracked in Neon"
              icon={CubeTransparent}
            />
            <MetricCard
              label="Funded batches"
              value={String(snapshot.fundedBatches)}
              detail="Vaults already funded by buyers"
              icon={Coins}
            />
            <MetricCard
              label="Settled batches"
              value={String(snapshot.settledBatches)}
              detail="Completed releases with auditable state transitions"
              icon={ArrowSquareOut}
            />
            <MetricCard
              label="Pending payouts"
              value={String(snapshot.pendingPayouts)}
              detail="Open flows awaiting quality or settlement release"
              icon={Broadcast}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="panel px-5 py-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
                Recent batches
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-[-0.05em] text-white">
                Open settlement inventory
              </h2>
            </div>
            <ButtonLink href="/batches" variant="ghost">
              View all batches
            </ButtonLink>
          </div>
          <div className="mt-6 overflow-x-auto rounded-[24px] border border-white/10 bg-white/3">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-4 py-3 font-medium">Batch ID</th>
                  <th className="px-4 py-3 font-medium">Crop</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.allBatches.slice(0, 6).map((batch) => (
                  <tr key={batch.id} className="border-t border-white/8 text-sm">
                    <td className="px-4 py-3 text-slate-100">{batch.id}</td>
                    <td className="px-4 py-3 text-slate-300">{batch.cropType}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={batch.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {formatDisplayAmount(batch.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatRelativeDate(batch.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel px-5 py-6 lg:px-8">
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
            Event pulse
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl tracking-[-0.05em] text-white">
              Realtime activity
            </h2>
            <span className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100">
              SSE ready
            </span>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Total payout volume: {formatDisplayAmount(snapshot.totalVolume)}
          </p>
          <div className="mt-6 space-y-3">
            {snapshot.recentEvents.map((event) => (
              <article
                key={`${event.kind}-${event.id}`}
                className="rounded-[20px] border border-white/10 bg-white/3 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-white">{event.label}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {event.kind}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{event.message}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {formatRelativeDate(event.createdAt)}
                </p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
