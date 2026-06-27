import { Broadcast } from "@phosphor-icons/react/dist/ssr";

type NetworkBadgeProps = {
  network?: string;
};

export function NetworkBadge({ network = "Stellar Testnet" }: NetworkBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100">
      <Broadcast size={12} weight="duotone" />
      {network}
    </span>
  );
}
