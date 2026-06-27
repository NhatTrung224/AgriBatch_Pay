import { ArrowSquareOut, Broadcast, Coins, CubeTransparent } from "@phosphor-icons/react/dist/ssr";

import { ButtonLink } from "@/components/ui/button-link";

const previewStats = [
  {
    label: "Live vault coverage",
    value: "87%",
    icon: Coins,
    detail: "Buyer funding and payout release readiness",
  },
  {
    label: "Batch sync",
    value: "12 open",
    icon: CubeTransparent,
    detail: "Cooperative lots waiting on approval states",
  },
  {
    label: "Event stream",
    value: "Realtime",
    icon: Broadcast,
    detail: "SSE feed wired for contract and app audit logs",
  },
];

export default function DashboardPreviewPage() {
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
                Operating center for crop batches, vault funding, and auditable
                payout release.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 lg:text-base">
                The shell is now fixed around a shared sidebar, mobile
                navigation, topbar telemetry, and composable panel system. The
                next milestones will plug real batch data, wallet flows, and
                Soroban actions into this frame.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/" variant="primary">
                Review Landing Direction
              </ButtonLink>
              <ButtonLink href="/submission" variant="ghost">
                Submission Surface
              </ButtonLink>
            </div>
          </div>
          <div className="grid gap-4">
            {previewStats.map(({ detail, icon: Icon, label, value }) => (
              <article
                key={label}
                className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,25,22,0.95),rgba(9,14,13,0.92))] p-4 shadow-[0_24px_70px_rgba(3,10,8,0.35)]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-emerald-200">
                    <Icon size={20} weight="duotone" />
                  </span>
                  <ArrowSquareOut size={18} className="text-cyan-200/80" />
                </div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  {label}
                </p>
                <p className="mt-3 font-display text-3xl tracking-[-0.04em] text-white">
                  {value}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
