type PlaceholderSurfaceProps = {
  description: string;
  eyebrow: string;
  title: string;
};

export function PlaceholderSurface({
  description,
  eyebrow,
  title,
}: PlaceholderSurfaceProps) {
  return (
    <section className="panel px-5 py-6 lg:px-8 lg:py-8">
      <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-slate-300">
        {eyebrow}
      </span>
      <div className="mt-5 max-w-3xl space-y-3">
        <h1 className="font-display text-4xl tracking-[-0.05em] text-white lg:text-5xl">
          {title}
        </h1>
        <p className="text-sm leading-7 text-slate-400 lg:text-base">{description}</p>
      </div>
    </section>
  );
}
