import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  children: React.ReactNode;
  className?: string;
  href: Route;
  variant?: "ghost" | "primary";
};

const variantClasses = {
  ghost:
    "border-white/12 bg-white/4 text-white hover:border-white/18 hover:bg-white/8",
  primary:
    "border-emerald-200/12 bg-[linear-gradient(135deg,rgba(140,246,193,0.96),rgba(109,229,255,0.84))] text-[#05110d] hover:brightness-105",
} as const;

export function ButtonLink({
  children,
  className,
  href,
  variant = "primary",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium tracking-[0.01em] transition duration-200 active:translate-y-px",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
