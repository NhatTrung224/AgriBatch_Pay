import { Wallet } from "@phosphor-icons/react/dist/ssr";

import type { WalletProvider } from "@/features/wallets/types";

const palette = {
  freighter:
    "border-emerald-200/18 bg-[linear-gradient(135deg,rgba(86,164,255,0.88),rgba(210,234,255,0.96))] text-[#041122]",
  rabet:
    "border-white/12 bg-[linear-gradient(135deg,rgba(11,11,11,0.95),rgba(54,54,54,0.98))] text-white",
} as const;

const labelMap: Record<WalletProvider, string> = {
  freighter: "Freighter",
  rabet: "Rabet",
};

export function WalletProviderBadge({
  compact = false,
  provider,
}: {
  compact?: boolean;
  provider: WalletProvider;
}) {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-100">
        <Wallet size={12} weight="duotone" />
        {labelMap[provider]}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex size-14 items-center justify-center rounded-[20px] border text-lg font-semibold ${palette[provider]}`}
    >
      {provider === "freighter" ? "F" : "R"}
    </span>
  );
}
