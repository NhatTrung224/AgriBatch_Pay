import { cn } from "@/lib/utils";
import type { BatchStatus } from "@/types/domain";

const statusTheme: Record<BatchStatus, string> = {
  CREATED: "border-white/12 bg-white/6 text-slate-100",
  FAILED: "border-rose-300/20 bg-rose-300/12 text-rose-100",
  FUNDED: "border-cyan-300/18 bg-cyan-300/10 text-cyan-100",
  LOTS_ADDED: "border-amber-300/18 bg-amber-300/10 text-amber-100",
  QUALITY_CONFIRMED: "border-emerald-200/18 bg-emerald-300/10 text-emerald-100",
  SETTLED: "border-emerald-200/18 bg-emerald-300/10 text-accent",
  SETTLEMENT_APPROVED: "border-cyan-300/18 bg-cyan-300/10 text-cyan-100",
  VAULT_REGISTERED: "border-white/12 bg-white/6 text-slate-100",
};

export function StatusBadge({ status }: { status: BatchStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em]",
        statusTheme[status],
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
