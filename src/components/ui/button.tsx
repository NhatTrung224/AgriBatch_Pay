import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "ghost" | "primary" | "secondary";
};

const variantClasses = {
  ghost:
    "border-white/12 bg-white/4 text-white hover:border-white/18 hover:bg-white/8",
  primary:
    "border-emerald-200/12 bg-[linear-gradient(135deg,rgba(140,246,193,0.96),rgba(109,229,255,0.84))] text-[#05110d] hover:brightness-105 disabled:text-[#163227]",
  secondary:
    "border-cyan-300/18 bg-cyan-300/8 text-cyan-100 hover:bg-cyan-300/12",
} as const;

export function Button({
  className,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium tracking-[0.01em] transition duration-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
