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
import { createBatchOnSoroban, getConfiguredRegistryContractId } from "@/lib/soroban/registry-contract";
import { getConfiguredPayoutVaultContractId } from "@/lib/soroban/payout-vault-contract";
import type { WalletProvider } from "@/types/domain";

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

function generateBatchId() {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 6).toUpperCase()
      : Math.random().toString(36).slice(2, 8).toUpperCase();

  return `BATCH-${new Date().getFullYear()}-${suffix}`;
}

export function CreateBatchForm() {
  const router = useRouter();
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [walletProvider, setWalletProvider] = useState<WalletProvider>("freighter");
  const registryContractId = getConfiguredRegistryContractId();
  const payoutVaultContractId = getConfiguredPayoutVaultContractId();
  const canSyncToSoroban = Boolean(registryContractId && payoutVaultContractId);
  const [syncWithSoroban, setSyncWithSoroban] = useState(canSyncToSoroban);
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
      const resolvedBatchId = parsed.data.batchId || generateBatchId();
      const payload = {
        ...parsed.data,
        batchId: resolvedBatchId,
      };

      if (syncWithSoroban) {
        if (!registryContractId || !payoutVaultContractId) {
          throw new Error("Registry and payout vault contract IDs must be configured.");
        }

        const receipt = await createBatchOnSoroban({
          assetCode: payload.assetCode,
          batchId: resolvedBatchId,
          buyerWallet: payload.buyerWallet,
          cooperativeWallet: payload.cooperativeWallet,
          cropType: payload.cropType,
          location: payload.location,
          provider: walletProvider,
          season: payload.season,
          vaultContractId: payoutVaultContractId,
        });

        Object.assign(payload, {
          provider: walletProvider,
          registryContractAddress: registryContractId,
          txHash: receipt.hash,
          vaultContractAddress: payoutVaultContractId,
        });
      }

      const response = await fetch("/api/batches", {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const responsePayload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setApiError(responsePayload?.error ?? "Unable to create batch.");
        toast.error(responsePayload?.error ?? "Unable to create batch.");
        return;
      }

      const detail = (await response.json()) as { batch: { id: string } };
      toast.success(
        syncWithSoroban
          ? `Batch ${detail.batch.id} created and mirrored to Soroban.`
          : `Batch ${detail.batch.id} created.`,
      );
      startTransition(() => {
        router.push(`/batches/${detail.batch.id}` as Route);
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create batch.";
      setApiError(message);
      toast.error(message);
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

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"
      >
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
          <Field label="Asset contract address (optional)">
            <input
              {...form.register("assetContractAddress")}
              className={inputClassName}
              placeholder="Optional SAC or asset contract reference"
            />
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

          <div className="mt-6 rounded-[22px] border border-white/10 bg-white/4 px-4 py-4">
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
              Soroban sync
            </p>
            <label className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-300">
              <span>Mirror batch creation to the batch registry contract</span>
              <input
                type="checkbox"
                checked={syncWithSoroban}
                onChange={(event) => setSyncWithSoroban(event.target.checked)}
                disabled={!canSyncToSoroban}
                className="size-4 accent-cyan-300"
              />
            </label>
            <div className="mt-4 space-y-3">
              <Field label="Signer provider">
                <select
                  value={walletProvider}
                  onChange={(event) =>
                    setWalletProvider(event.target.value as WalletProvider)
                  }
                  className={inputClassName}
                >
                  <option value="freighter">Freighter</option>
                  <option value="rabet">Rabet</option>
                </select>
              </Field>
              <Field label="Registry contract">
                <input
                  readOnly
                  value={registryContractId ?? "Not configured"}
                  className={inputClassName}
                />
              </Field>
              <Field label="Payout vault contract">
                <input
                  readOnly
                  value={payoutVaultContractId ?? "Not configured"}
                  className={inputClassName}
                />
              </Field>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              When enabled, the cooperative signer submits a Soroban
              <code className="ml-1">create_batch</code>
              transaction before the batch is persisted to Neon.
            </p>
          </div>

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
