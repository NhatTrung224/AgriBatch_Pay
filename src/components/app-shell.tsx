"use client";

import {
  Broadcast,
  ClipboardText,
  Cube,
  HouseLine,
  ListChecks,
  Plant,
  Rows,
} from "@phosphor-icons/react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
};

const primaryNav = [
  { href: "/dashboard", icon: HouseLine, label: "Overview" },
  { href: "/onboarding", icon: Rows, label: "Onboarding" },
  { href: "/batches", icon: Cube, label: "Batches" },
  { href: "/farmers", icon: Plant, label: "Farmers" },
  { href: "/events", icon: Broadcast, label: "Events" },
  { href: "/submission", icon: ClipboardText, label: "Submission" },
] as const satisfies ReadonlyArray<{
  href: Route;
  icon: typeof HouseLine;
  label: string;
}>;

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1720px] gap-4 px-3 py-3 lg:gap-5 lg:px-5 lg:py-5">
        <aside className="panel hidden w-[290px] shrink-0 overflow-hidden lg:flex lg:flex-col">
          <div className="border-b border-white/8 px-5 py-5">
            <BrandSignature />
          </div>
          <nav className="flex-1 space-y-2 px-3 py-4">
            {primaryNav.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group flex items-center gap-3 rounded-[18px] border px-4 py-3 transition-all duration-200",
                    isActive
                      ? "border-white/10 bg-white/9 text-white shadow-[0_12px_30px_rgba(4,12,10,0.25)]"
                      : "border-transparent bg-transparent text-slate-400 hover:border-white/8 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-10 items-center justify-center rounded-2xl border transition-colors",
                      isActive
                        ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-200"
                        : "border-white/10 bg-white/5 text-slate-500 group-hover:border-emerald-200/20 group-hover:text-emerald-100",
                    )}
                  >
                    <Icon size={19} weight={isActive ? "duotone" : "regular"} />
                  </span>
                  <span className="text-sm font-medium tracking-[0.01em]">{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/8 px-4 py-4">
            <div className="rounded-[24px] border border-emerald-300/14 bg-[linear-gradient(180deg,rgba(140,246,193,0.12),rgba(109,229,255,0.02))] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">
                Deployment
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Railway-ready standalone build, Neon-backed data model, and
                health endpoint already wired.
              </p>
              <ButtonLink href="/submission" variant="ghost" className="mt-4 w-full">
                Review checklist
              </ButtonLink>
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col">
          <header className="panel mb-4 px-4 py-3 lg:mb-5 lg:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen((value) => !value)}
                  className="inline-flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white lg:hidden"
                  aria-expanded={isMobileNavOpen}
                  aria-label="Toggle navigation"
                >
                  <ListChecks size={20} />
                </button>
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.24em] text-slate-500">
                    AgriBatch Pay
                  </p>
                  <p className="font-display text-2xl tracking-[-0.04em] text-white">
                    Stellar testnet settlement workspace
                  </p>
                </div>
              </div>

              <div className="hidden items-center gap-3 md:flex">
                <StatusChip label="Realtime events" value="SSE ready" tone="cyan" />
                <StatusChip label="Network" value="Stellar Testnet" tone="emerald" />
                <StatusChip label="Database" value="Neon connected" tone="amber" />
              </div>
            </div>
            {isMobileNavOpen ? (
              <nav className="mt-4 grid gap-2 border-t border-white/8 pt-4 lg:hidden">
                {primaryNav.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={cn(
                      "rounded-[18px] border px-4 py-3 text-sm transition-colors",
                      pathname === href || pathname.startsWith(`${href}/`)
                        ? "border-white/12 bg-white/9 text-white"
                        : "border-white/8 bg-white/4 text-slate-300",
                    )}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            ) : null}
          </header>

          <main className="min-h-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

function BrandSignature() {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <span className="inline-flex size-12 items-center justify-center rounded-[18px] border border-emerald-200/20 bg-[linear-gradient(135deg,rgba(140,246,193,0.24),rgba(109,229,255,0.16))] text-emerald-50 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
        <Plant size={24} weight="duotone" />
      </span>
      <div>
        <p className="font-display text-xl tracking-[-0.04em] text-white">
          AgriBatch Pay
        </p>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
          Crop batch settlement
        </p>
      </div>
    </Link>
  );
}

function StatusChip({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "amber" | "cyan" | "emerald";
  value: string;
}) {
  const toneStyles = {
    amber: "border-amber-300/16 bg-amber-300/8 text-amber-100",
    cyan: "border-cyan-300/16 bg-cyan-300/8 text-cyan-100",
    emerald: "border-emerald-300/16 bg-emerald-300/8 text-emerald-100",
  } as const;

  return (
    <div
      className={cn(
        "rounded-[18px] border px-3 py-2 text-right shadow-[0_10px_24px_rgba(4,12,10,0.18)]",
        toneStyles[tone],
      )}
    >
      <p className="text-[0.65rem] uppercase tracking-[0.22em] text-current/55">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-current">{value}</p>
    </div>
  );
}
