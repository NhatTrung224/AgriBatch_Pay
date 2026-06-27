"use client";

import { CalendarBlank, FloppyDisk } from "@phosphor-icons/react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { createBatchSchema } from "@/lib/validation/batches";

type CreateBatchValues = {
  assetCode: string;
  assetContractAddress?: string;
  batchId?: string;
  buyerWallet: string;
  cooperativeWallet: string;
  cropType: string;
  expectedPayoutDate?: string;
  location: string;
  season: string;
};

export function CreateBatchForm() {
  const router = useRouter();
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateBatchValues>({
    defaultValues: {
      assetCode: "USDC",
      assetContractAddress: "",
      batchId: "",
      buyerWallet: "",
      cooperativeWallet: "",
      cropType: "Robusta Coffee",
      expectedPayoutDate: "",
      location: "Dak Lak, Vietnam",
      season: "Monsoon 2026",
    },
  });

  async function onSubmit(values: CreateBatchValues) {
    const parsed = createBatchSchema.safeParse(values);

    if (!parsed.success) {
      setApiError(parsed.error.issues[0]?.message ?? "Form validation failed.");
      return;
    }

    setApiError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/batches", {
        body: JSON.stringify(parsed.data),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setApiError(payload?.error ?? "Unable to create batch.");
        toast.error(payload?.error ?? "Unable to create batch.");
        return;
      }

      const detail = (await response.json()) as { batch: { id: string } };
      toast.success(`Batch ${detail.batch.id} created.`);
      startTransition(() => {
        router.push(`/batches/${detail.batch.id}` as Route);
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel px-5 py-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-slate-300">
            Create crop batch
          </span>
          <h1 className="mt-4 font-display text-[3rem] tracking-[-0.06em] text-white">
            Register a batch before lots, funding, and settlement approvals.
          </h1>
        </div>
        <ButtonLink href="/batches" variant="ghost">
          Back to batches
        </ButtonLink>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Crop type">
            <input {...form.register("cropType")} className={inputClassName} />
          </Field>
          <Field label="Season">
            <input {...form.register("season")} className={inputClassName} />
          </Field>
          <Field label="Location">
            <input {...form.register("location")} className={inputClassName} />
          </Field>
          <Field label="Asset">
            <input {...form.register("assetCode")} className={inputClassName} />
          </Field>
          <Field label="Buyer wallet">
            <input {...form.register("buyerWallet")} className={inputClassName} />
          </Field>
          <Field label="Cooperative wallet">
            <input
              {...form.register("cooperativeWallet")}
              className={inputClassName}
            />
          </Field>
          <Field label="Batch ID (optional)">
            <input {...form.register("batchId")} className={inputClassName} />
          </Field>
          <Field label="Expected payout date">
            <div className="relative">
              <CalendarBlank
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="datetime-local"
                {...form.register("expectedPayoutDate")}
                className={inputClassName}
              />
            </div>
          </Field>
        </div>

        <aside className="rounded-[28px] border border-white/10 bg-white/3 px-5 py-6">
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
            Validation
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-400">
            <li>Buyer and cooperative wallets must be valid Stellar public keys.</li>
            <li>Asset, crop type, season, and location are required.</li>
            <li>Batch ID can be supplied manually or generated automatically.</li>
          </ul>

          {apiError ? (
            <div className="mt-6 rounded-[20px] border border-rose-300/20 bg-rose-300/10 px-4 py-4 text-sm text-rose-100">
              {apiError}
            </div>
          ) : null}

          <Button
            type="submit"
            className="mt-6 w-full"
            disabled={isSubmitting || isPending}
          >
            <FloppyDisk size={18} className="mr-2" />
            {isSubmitting || isPending ? "Creating..." : "Create Crop Batch"}
          </Button>
        </aside>
      </form>
    </section>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="space-y-3">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-12 w-full rounded-[18px] border border-white/10 bg-white/4 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/20";
