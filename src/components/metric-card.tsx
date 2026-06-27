type MetricCardIcon = React.ComponentType<{
  className?: string;
  size?: number;
  weight?: "bold" | "duotone" | "fill" | "light" | "regular" | "thin";
}>;

type MetricCardProps = {
  detail: string;
  icon: MetricCardIcon;
  label: string;
  value: string;
};

export function MetricCard({ detail, icon: Icon, label, value }: MetricCardProps) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,25,22,0.95),rgba(9,14,13,0.92))] p-4 shadow-[0_24px_70px_rgba(3,10,8,0.35)]">
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-emerald-200">
          <Icon size={20} weight="duotone" />
        </span>
      </div>
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-3 font-display text-3xl tracking-[-0.04em] text-white">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
    </article>
  );
}
