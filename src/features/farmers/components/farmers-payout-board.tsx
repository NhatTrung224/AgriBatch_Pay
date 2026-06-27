import { Coins, Plant, Wallet } from "@phosphor-icons/react/dist/ssr";

import { TransactionHashLink } from "@/components/transaction-hash-link";
import { formatDisplayAmount, formatRelativeDate, shortenAddress } from "@/lib/formatters";

type FarmersPayoutBoardProps = {
  board: {
    items: Array<{
      batch: {
        cropType: string;
        id: string;
        season: string;
      } | null;
      lot: {
        createdAt: Date;
        farmerName: string;
        farmerWallet: string;
        grade: number;
        id: string;
        paid: boolean;
        payoutAmount: number;
        payoutTxHash: string | null;
        weightKg: number;
      };
    }>;
    paidCount: number;
    totalExpectedPayout: number;
    unpaidCount: number;
  };
};

export function FarmersPayoutBoard({ board }: FarmersPayoutBoardProps) {
  return (
    <div className="space-y-4">
      <section className="panel px-5 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-slate-300">
              Farmer payouts
            </span>
            <h1 className="mt-4 font-display text-[3rem] tracking-[-0.06em] text-white">
              Assigned lots, payout value, and release proof by farmer wallet.
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100">
            <Wallet size={14} weight="fill" />
            Wallet-facing ledger
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <MetricCard
            icon={<Coins size={18} className="text-emerald-100" />}
            label="Expected payout"
            value={formatDisplayAmount(board.totalExpectedPayout)}
          />
          <MetricCard
            icon={<Plant size={18} className="text-cyan-100" />}
            label="Unpaid lots"
            value={String(board.unpaidCount)}
          />
          <MetricCard
            icon={<Wallet size={18} className="text-amber-100" />}
            label="Paid lots"
            value={String(board.paidCount)}
          />
        </div>
      </section>

      <section className="panel px-5 py-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
              Lot ledger
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-[-0.05em] text-white">
              Farmer payout records
            </h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
            {board.items.length} total lots
          </span>
        </div>

        {!board.items.length ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-white/12 bg-white/3 px-6 py-10 text-center">
            <p className="font-display text-2xl tracking-[-0.04em] text-white">
              No farmer payout records yet.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Add farmer lots from a batch detail page and this ledger will
              populate automatically.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-[24px] border border-white/10 bg-white/3">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-4 py-3 font-medium">Farmer</th>
                  <th className="px-4 py-3 font-medium">Wallet</th>
                  <th className="px-4 py-3 font-medium">Batch</th>
                  <th className="px-4 py-3 font-medium">Payout</th>
                  <th className="px-4 py-3 font-medium">State</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {board.items.map(({ batch, lot }) => (
                  <tr key={lot.id} className="border-t border-white/8 text-sm">
                    <td className="px-4 py-4">
                      <p className="font-medium text-white">{lot.farmerName}</p>
                      <p className="mt-1 text-slate-500">Grade {lot.grade}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      {shortenAddress(lot.farmerWallet)}
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      <p>{batch?.id ?? lot.id}</p>
                      <p className="mt-1 text-slate-500">
                        {batch ? `${batch.cropType} · ${batch.season}` : "Batch unavailable"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      <p>{formatDisplayAmount(lot.payoutAmount)}</p>
                      <p className="mt-1 text-slate-500">{lot.weightKg} kg</p>
                    </td>
                    <td className="px-4 py-4">
                      {lot.paid && lot.payoutTxHash ? (
                        <div className="space-y-2">
                          <span className="inline-flex rounded-full border border-emerald-200/18 bg-emerald-300/10 px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] text-emerald-100">
                            Paid
                          </span>
                          <TransactionHashLink
                            value={lot.payoutTxHash}
                            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-100"
                          />
                        </div>
                      ) : (
                        <span className="inline-flex rounded-full border border-amber-300/18 bg-amber-300/10 px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] text-amber-100">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {formatRelativeDate(lot.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/3 px-4 py-4">
      <div className="flex items-center gap-3">
        {icon}
        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>
      </div>
      <p className="mt-4 text-sm font-medium text-white">{value}</p>
    </article>
  );
}
