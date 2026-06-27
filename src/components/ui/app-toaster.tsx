"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      closeButton
      position="top-right"
      richColors
      theme="dark"
      toastOptions={{
        className:
          "border border-white/10 bg-[rgba(8,12,12,0.96)] text-slate-100 shadow-[0_24px_60px_rgba(0,0,0,0.35)]",
      }}
    />
  );
}
