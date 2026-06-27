import {
  CheckCircle,
  Coins,
  Cube,
  Leaf,
  Lock,
} from "@phosphor-icons/react/dist/ssr";

const metrics = [
  { label: "Total Batches", value: "24", icon: Leaf, tone: "emerald" },
  { label: "Total Funded", value: "12,450 XLM", icon: Coins, tone: "white" },
  { label: "Total Paid", value: "8,760 XLM", icon: CheckCircle, tone: "emerald" },
  { label: "Active Vaults", value: "7", icon: Lock, tone: "white" },
] as const;

const recentBatches = [
  {
    id: "BATCH-00024",
    crop: "Maize",
    cooperative: "Greenfield Coop",
    status: "Settlement Approved",
    updated: "2m ago",
  },
  {
    id: "BATCH-00023",
    crop: "Rice",
    cooperative: "River Valley Coop",
    status: "Quality Confirmed",
    updated: "15m ago",
  },
  {
    id: "BATCH-00022",
    crop: "Wheat",
    cooperative: "Sunrise Coop",
    status: "Vault Funded",
    updated: "1h ago",
  },
  {
    id: "BATCH-00021",
    crop: "Maize",
    cooperative: "Greenfield Coop",
    status: "Batch Created",
    updated: "3h ago",
  },
] as const;

export function LandingHeroPreview() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,15,14,0.98),rgba(4,7,7,0.94))]">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3 lg:px-5">
        <div className="flex items-center gap-2 text-white">
          <span className="inline-flex size-8 items-center justify-center rounded-xl border border-emerald-200/18 bg-emerald-300/10 text-accent">
            <Leaf size={18} weight="duotone" />
          </span>
          <span className="text-sm font-medium">AgriBatch Pay</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-emerald-200/16 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
            Stellar Testnet
          </span>
          <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-slate-300">
            GAB...F73D
          </span>
        </div>
      </div>
      <div className="grid gap-0 lg:grid-cols-[180px_1fr_200px]">
        <aside className="border-b border-white/8 px-4 py-4 lg:border-b-0 lg:border-r lg:px-4">
          <nav className="space-y-2">
            <PreviewNavItem label="Overview" active />
            <PreviewNavItem label="Batches" />
            <PreviewNavItem label="Vaults" />
            <PreviewNavItem label="Payouts" />
            <PreviewNavItem label="Submissions" />
            <PreviewNavItem label="Audit Log" />
            <PreviewNavItem label="Participants" />
            <PreviewNavItem label="Settings" />
          </nav>
        </aside>

        <section className="border-b border-white/8 px-4 py-4 lg:border-b-0 lg:px-5 lg:py-5">
          <h3 className="font-display text-3xl tracking-[-0.05em] text-white">
            Overview
          </h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map(({ icon: Icon, label, tone, value }) => (
              <article
                key={label}
                className="rounded-[20px] border border-white/10 bg-white/3 px-4 py-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {label}
                  </span>
                  <span
                    className={`inline-flex size-9 items-center justify-center rounded-2xl ${
                      tone === "emerald"
                        ? "border border-emerald-200/18 bg-emerald-300/10 text-accent"
                        : "border border-white/10 bg-white/5 text-slate-300"
                    }`}
                  >
                    <Icon size={18} weight="duotone" />
                  </span>
                </div>
                <p className="mt-5 font-display text-3xl tracking-[-0.05em] text-white">
                  {value}
                </p>
              </article>
            ))}
          </div>

          <article className="mt-4 rounded-[24px] border border-white/10 bg-white/3">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-4">
              <h4 className="text-lg font-medium text-white">Recent Batches</h4>
              <span className="text-sm text-cyan-200">View all</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-4 py-3 font-medium">Batch ID</th>
                    <th className="px-4 py-3 font-medium">Crop</th>
                    <th className="px-4 py-3 font-medium">Cooperative</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBatches.map((batch) => (
                    <tr key={batch.id} className="border-t border-white/8 text-sm">
                      <td className="px-4 py-3 text-slate-200">{batch.id}</td>
                      <td className="px-4 py-3 text-slate-300">{batch.crop}</td>
                      <td className="px-4 py-3 text-slate-300">{batch.cooperative}</td>
                      <td className="px-4 py-3">
                        <span className="text-cyan-200">{batch.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{batch.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <aside className="px-4 py-4 lg:border-l lg:border-white/8 lg:px-4">
          <article className="rounded-[24px] border border-white/10 bg-white/3 px-4 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Vault Balance
            </p>
            <p className="mt-4 font-display text-4xl tracking-[-0.05em] text-white">
              3,690 XLM
            </p>
            <p className="mt-4 text-sm text-slate-400">Available to Payout</p>
            <p className="mt-2 text-2xl font-medium text-accent">1,240 XLM</p>
            <button
              type="button"
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 text-sm font-medium text-cyan-100"
            >
              Fund Vault
            </button>
          </article>

          <article className="mt-4 rounded-[24px] border border-white/10 bg-white/3 px-4 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Network</p>
            <div className="mt-4 space-y-4 text-sm text-slate-300">
              <div>
                <p>Stellar Testnet</p>
                <p className="mt-1 text-accent">Connected</p>
              </div>
              <div>
                <p className="text-slate-500">Ledger</p>
                <p className="mt-1 text-white">Latest: 74203915</p>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}

function PreviewNavItem({
  active = false,
  label,
}: {
  active?: boolean;
  label: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-[18px] border px-3 py-2.5 text-sm ${
        active
          ? "border-emerald-200/18 bg-emerald-300/10 text-accent"
          : "border-transparent bg-transparent text-slate-400"
      }`}
    >
      <span className="inline-flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <Cube size={16} weight={active ? "duotone" : "regular"} />
      </span>
      <span>{label}</span>
    </div>
  );
}
