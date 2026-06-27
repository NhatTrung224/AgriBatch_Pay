"use client";

import { CheckCircle, Coins, ShieldCheck, UsersThree } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/status-badge";
import { TransactionHashLink } from "@/components/transaction-hash-link";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import type { AppEventSelect, BatchSelect, FarmerLotSelect } from "@/lib/db/schema";
import { formatDisplayAmount, formatRelativeDate, shortenAddress } from "@/lib/formatters";
import { fundVaultOnSoroban, getConfiguredPayoutVaultContractId, approveSettlementOnSoroban } from "@/lib/soroban/payout-vault-contract";
import { confirmQualityOnSoroban, getConfiguredRegistryContractId } from "@/lib/soroban/registry-contract";
import { cn } from "@/lib/utils";
import { getBatchWorkflowState } from "@/features/batches/workflow";
import type { WalletProvider } from "@/types/domain";

type BatchDetailWorkspaceProps = {
  detail: {
    batch: BatchSelect;
    events: AppEventSelect[];
    lots: Array<FarmerLotSelect>;
  };
};

type FarmerLotFormState = {
  farmerName: string;
  farmerWallet: string;
  grade: string;
  pricePerKg: string;
  weightKg: string;
};

type WalletActionState = {
  provider: WalletProvider;
  publicKey: string;
  txHash: string;
};

const inputClassName =
  "h-11 w-full rounded-[18px] border border-white/10 bg-white/4 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/20";

export function BatchDetailWorkspace({ detail }: BatchDetailWorkspaceProps) {
  const router = useRouter();
  const [busyAction, setBusyAction] = useState<null | string>(null);
  const [lotForm, setLotForm] = useState<FarmerLotFormState>({
    farmerName: "",
    farmerWallet: "",
    grade: "1",
    pricePerKg: "9.2",
    weightKg: "",
  });
  const [qualityForm, setQualityForm] = useState<WalletActionState>({
    provider: "freighter",
    publicKey: detail.batch.cooperativeWallet,
    txHash: "",
  });
  const [fundingForm, setFundingForm] = useState<WalletActionState>({
    provider: "freighter",
    publicKey: detail.batch.buyerWallet,
    txHash: "",
  });
  const [approvalForm, setApprovalForm] = useState<WalletActionState>({
    provider: "freighter",
    publicKey: detail.batch.buyerWallet,
    txHash: "",
  });
  const registryContractId = getConfiguredRegistryContractId();
  const payoutVaultContractId = getConfiguredPayoutVaultContractId();
  const hasSorobanRegistry = Boolean(registryContractId);
  const hasSorobanVault = Boolean(registryContractId && payoutVaultContractId);

  const workflow = getBatchWorkflowState({
    hasLots: detail.lots.length > 0,
    hasQualityConfirmation: detail.events.some((event) => event.type === "quality_confirmed"),
    hasVaultFunding: detail.events.some((event) => event.type === "vault_funded"),
    status: detail.batch.status,
    totalAmount: detail.batch.totalAmount,
  });

  async function postJson<TBody>(path: string, action: string, body?: TBody) {
    try {
      setBusyAction(action);
      const response = await fetch(path, {
        body: body ? JSON.stringify(body) : undefined,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to complete this action.");
      }

      router.refresh();
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to complete this action.";
      toast.error(message);
      return false;
    } finally {
      setBusyAction(null);
    }
  }

  async function handleAddFarmerLot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const completed = await postJson(
      `/api/batches/${detail.batch.id}/lots`,
      "add_lot",
      {
        farmerName: lotForm.farmerName,
        farmerWallet: lotForm.farmerWallet,
        grade: Number(lotForm.grade),
        pricePerKg: Number(lotForm.pricePerKg),
        weightKg: Number(lotForm.weightKg),
      },
    );

    if (!completed) {
      return;
    }

    toast.success("Farmer lot added to batch.");
    setLotForm({
      farmerName: "",
      farmerWallet: "",
      grade: "1",
      pricePerKg: lotForm.pricePerKg,
      weightKg: "",
    });
  }

  async function handleConfirmQuality(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const txHash =
        qualityForm.txHash ||
        (hasSorobanRegistry
          ? (
              await confirmQualityOnSoroban({
                batchId: detail.batch.id,
                provider: qualityForm.provider,
                publicKey: qualityForm.publicKey,
              })
            ).hash
          : "");

      const completed = await postJson(
        `/api/batches/${detail.batch.id}/quality`,
        "confirm_quality",
        {
          provider: qualityForm.provider,
          publicKey: qualityForm.publicKey,
          txHash,
        },
      );

      if (completed) {
        toast.success(
          hasSorobanRegistry && txHash
            ? "Batch quality confirmed on Soroban and mirrored locally."
            : "Batch quality confirmed.",
        );
        setQualityForm((current) => ({ ...current, txHash: "" }));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to confirm quality.";
      toast.error(message);
    }
  }

  async function handleFundVault(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const txHash =
        fundingForm.txHash ||
        (hasSorobanVault && registryContractId
          ? (
              await fundVaultOnSoroban({
                amount: detail.batch.totalAmount,
                batchId: detail.batch.id,
                provider: fundingForm.provider,
                publicKey: fundingForm.publicKey,
                registryContractId,
              })
            ).hash
          : "");

      const completed = await postJson(
        `/api/batches/${detail.batch.id}/fund`,
        "fund_vault",
        {
          ...fundingForm,
          txHash,
        },
      );

      if (completed) {
        toast.success(
          hasSorobanVault && txHash
            ? "Payout vault funded on Soroban and mirrored locally."
            : "Payout vault funded.",
        );
        setFundingForm((current) => ({ ...current, txHash: "" }));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to fund the payout vault.";
      toast.error(message);
    }
  }

  async function handleApproveSettlement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const txHash =
        approvalForm.txHash ||
        (hasSorobanVault
          ? (
              await approveSettlementOnSoroban({
                batchId: detail.batch.id,
                provider: approvalForm.provider,
                publicKey: approvalForm.publicKey,
              })
            ).hash
          : "");

      const completed = await postJson(
        `/api/batches/${detail.batch.id}/approve`,
        "approve_settlement",
        {
          ...approvalForm,
          txHash,
        },
      );

      if (completed) {
        toast.success(
          hasSorobanVault && txHash
            ? "Settlement approved on Soroban and payout release recorded."
            : "Settlement approved and payout release recorded.",
        );
        setApprovalForm((current) => ({ ...current, txHash: "" }));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to approve settlement.";
      toast.error(message);
    }
  }

  return (
    <div className="space-y-4">
      <section className="panel px-5 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-slate-300">
              Batch detail
            </span>
            <h1 className="mt-4 font-display text-[3rem] tracking-[-0.06em] text-white">
              {detail.batch.id}
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <StatusBadge status={detail.batch.status} />
            <ButtonLink href="/batches/new" variant="ghost">
              Create another batch
            </ButtonLink>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          <InfoCard label="Crop" value={detail.batch.cropType} />
          <InfoCard label="Season" value={detail.batch.season} />
          <InfoCard label="Total payout" value={formatDisplayAmount(detail.batch.totalAmount)} />
          <InfoCard label="Updated" value={formatRelativeDate(detail.batch.updatedAt)} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <InfoCard label="Buyer wallet" value={shortenAddress(detail.batch.buyerWallet)} />
          <InfoCard
            label="Cooperative wallet"
            value={shortenAddress(detail.batch.cooperativeWallet)}
          />
          <InfoCard
            label="Registry contract"
            value={detail.batch.registryContractAddress ?? "Pending deployment"}
          />
          <InfoCard
            label="Vault contract"
            value={detail.batch.vaultContractAddress ?? "Pending deployment"}
          />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.84fr]">
          <ActionCard
            eyebrow="Cooperative operations"
            title="Farmer lot intake and quality gate"
            description="Add payout-bearing lots first, then confirm the quality milestone before the buyer releases funds."
          >
            <form className="grid gap-3 md:grid-cols-2" onSubmit={handleAddFarmerLot}>
              <Field label="Farmer name">
                <input
                  value={lotForm.farmerName}
                  onChange={(event) =>
                    setLotForm((current) => ({ ...current, farmerName: event.target.value }))
                  }
                  className={inputClassName}
                  placeholder="Nguyen Van Loc"
                />
              </Field>
              <Field label="Farmer wallet">
                <input
                  value={lotForm.farmerWallet}
                  onChange={(event) =>
                    setLotForm((current) => ({ ...current, farmerWallet: event.target.value }))
                  }
                  className={inputClassName}
                  placeholder="G..."
                />
              </Field>
              <Field label="Weight (kg)">
                <input
                  value={lotForm.weightKg}
                  onChange={(event) =>
                    setLotForm((current) => ({ ...current, weightKg: event.target.value }))
                  }
                  className={inputClassName}
                  inputMode="decimal"
                  placeholder="1280"
                />
              </Field>
              <Field label="Price per kg">
                <input
                  value={lotForm.pricePerKg}
                  onChange={(event) =>
                    setLotForm((current) => ({ ...current, pricePerKg: event.target.value }))
                  }
                  className={inputClassName}
                  inputMode="decimal"
                  placeholder="9.2"
                />
              </Field>
              <Field label="Grade">
                <select
                  value={lotForm.grade}
                  onChange={(event) =>
                    setLotForm((current) => ({ ...current, grade: event.target.value }))
                  }
                  className={inputClassName}
                >
                  <option value="1">Grade 1</option>
                  <option value="2">Grade 2</option>
                  <option value="3">Grade 3</option>
                </select>
              </Field>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={!workflow.canAddLot || busyAction === "add_lot"}
                  className="w-full"
                >
                  <UsersThree size={18} className="mr-2" />
                  {busyAction === "add_lot" ? "Adding lot..." : "Add farmer lot"}
                </Button>
              </div>
            </form>
            <ActionHint message={workflow.reasons.addLot} />
            <form
              className="mt-5 grid gap-3 border-t border-white/8 pt-5"
              onSubmit={handleConfirmQuality}
            >
              <div>
                <p className="text-sm font-medium text-white">Quality confirmation</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Batch needs at least one lot before this step unlocks. If the
                  registry contract is configured, this action will call
                  <code className="ml-1">confirm_quality</code>
                  first and persist the resulting tx hash.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Provider">
                  <select
                    value={qualityForm.provider}
                    onChange={(event) =>
                      setQualityForm((current) => ({
                        ...current,
                        provider: event.target.value as WalletProvider,
                      }))
                    }
                    className={inputClassName}
                  >
                    <option value="freighter">Freighter</option>
                    <option value="rabet">Rabet</option>
                  </select>
                </Field>
                <Field label="Approver public key">
                  <input
                    value={qualityForm.publicKey}
                    onChange={(event) =>
                      setQualityForm((current) => ({
                        ...current,
                        publicKey: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </Field>
              </div>
              <Field label="Quality tx hash (optional)">
                <input
                  value={qualityForm.txHash}
                  onChange={(event) =>
                    setQualityForm((current) => ({
                      ...current,
                      txHash: event.target.value,
                    }))
                  }
                  className={inputClassName}
                  placeholder="Soroban tx hash or leave blank to invoke contract"
                />
              </Field>
              <Button
                type="submit"
                variant="secondary"
                disabled={!workflow.canConfirm || busyAction === "confirm_quality"}
              >
                <ShieldCheck size={18} className="mr-2" />
                {busyAction === "confirm_quality" ? "Confirming..." : "Confirm quality"}
              </Button>
            </form>
            <ActionHint message={workflow.reasons.confirm} className="mt-3" />
          </ActionCard>

          <ActionCard
            eyebrow="Buyer settlement"
            title="Fund vault and approve final payout"
            description="Buyer-side actions capture provider, signing key, and transaction proof for audit records."
          >
            <form className="grid gap-3" onSubmit={handleFundVault}>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Provider">
                  <select
                    value={fundingForm.provider}
                    onChange={(event) =>
                      setFundingForm((current) => ({
                        ...current,
                        provider: event.target.value as WalletProvider,
                      }))
                    }
                    className={inputClassName}
                  >
                    <option value="freighter">Freighter</option>
                    <option value="rabet">Rabet</option>
                  </select>
                </Field>
                <Field label="Buyer public key">
                  <input
                    value={fundingForm.publicKey}
                    onChange={(event) =>
                      setFundingForm((current) => ({ ...current, publicKey: event.target.value }))
                    }
                    className={inputClassName}
                  />
                </Field>
              </div>
              <Field label="Funding tx hash (optional)">
                <input
                  value={fundingForm.txHash}
                  onChange={(event) =>
                    setFundingForm((current) => ({ ...current, txHash: event.target.value }))
                  }
                  className={inputClassName}
                  placeholder="Stellar tx hash"
                />
              </Field>
              <Button
                type="submit"
                disabled={!workflow.canFund || busyAction === "fund_vault"}
                className="w-full"
              >
                <Coins size={18} className="mr-2" />
                {busyAction === "fund_vault" ? "Funding vault..." : "Fund payout vault"}
              </Button>
            </form>
            <ActionHint message={workflow.reasons.fund} />
            {hasSorobanVault ? (
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Empty tx hash fields will trigger a live
                <code className="mx-1">fund_vault</code>
                call against the configured payout vault contract.
              </p>
            ) : null}

            <form className="mt-5 grid gap-3 border-t border-white/8 pt-5" onSubmit={handleApproveSettlement}>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Provider">
                  <select
                    value={approvalForm.provider}
                    onChange={(event) =>
                      setApprovalForm((current) => ({
                        ...current,
                        provider: event.target.value as WalletProvider,
                      }))
                    }
                    className={inputClassName}
                  >
                    <option value="freighter">Freighter</option>
                    <option value="rabet">Rabet</option>
                  </select>
                </Field>
                <Field label="Buyer public key">
                  <input
                    value={approvalForm.publicKey}
                    onChange={(event) =>
                      setApprovalForm((current) => ({ ...current, publicKey: event.target.value }))
                    }
                    className={inputClassName}
                  />
                </Field>
              </div>
              <Field label="Settlement tx hash (optional)">
                <input
                  value={approvalForm.txHash}
                  onChange={(event) =>
                    setApprovalForm((current) => ({ ...current, txHash: event.target.value }))
                  }
                  className={inputClassName}
                  placeholder="Stellar tx hash"
                />
              </Field>
              <Button
                type="submit"
                disabled={!workflow.canApprove || busyAction === "approve_settlement"}
                className="w-full"
              >
                <CheckCircle size={18} className="mr-2" />
                {busyAction === "approve_settlement"
                  ? "Approving settlement..."
                  : "Approve and release payout"}
              </Button>
            </form>
            <ActionHint message={workflow.reasons.approve} className="mt-3" />
            {hasSorobanVault ? (
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Empty settlement tx hash fields will invoke
                <code className="mx-1">approve_settlement</code>
                before the local payout state is updated.
              </p>
            ) : null}
          </ActionCard>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="panel px-5 py-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
                Farmer lots
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-[-0.05em] text-white">
                Payout ledger
              </h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
              {detail.lots.length} lots
            </span>
          </div>
          {!detail.lots.length ? (
            <div className="mt-5 rounded-[24px] border border-dashed border-white/12 bg-white/3 px-5 py-8">
              <p className="text-sm leading-7 text-slate-400">
                No farmer lots attached yet. Use the cooperative panel above to
                create the payout-bearing records for this batch.
              </p>
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto rounded-[24px] border border-white/10 bg-white/3">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-4 py-3 font-medium">Farmer</th>
                    <th className="px-4 py-3 font-medium">Wallet</th>
                    <th className="px-4 py-3 font-medium">Weight</th>
                    <th className="px-4 py-3 font-medium">Grade</th>
                    <th className="px-4 py-3 font-medium">Payout</th>
                    <th className="px-4 py-3 font-medium">State</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.lots.map((lot) => (
                    <tr key={lot.id} className="border-t border-white/8 text-sm">
                      <td className="px-4 py-3 text-white">{lot.farmerName}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {shortenAddress(lot.farmerWallet)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{lot.weightKg} kg</td>
                      <td className="px-4 py-3 text-slate-300">Grade {lot.grade}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {formatDisplayAmount(lot.payoutAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em]",
                            lot.paid
                              ? "border-emerald-200/18 bg-emerald-300/10 text-emerald-100"
                              : "border-amber-300/18 bg-amber-300/10 text-amber-100",
                          )}
                        >
                          {lot.paid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="panel px-5 py-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
                Audit log
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-[-0.05em] text-white">
                Event timeline
              </h2>
            </div>
            {detail.batch.lastTxHash ? (
              <TransactionHashLink
                value={detail.batch.lastTxHash}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100"
              />
            ) : null}
          </div>
          <div className="mt-5 space-y-3">
            {detail.events.map((event) => (
              <article
                key={event.id}
                className="rounded-[20px] border border-white/10 bg-white/3 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-white">{event.type}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {formatRelativeDate(event.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{event.message}</p>
                {event.txHash ? (
                  <TransactionHashLink
                    value={event.txHash}
                    className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-100"
                  />
                ) : null}
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function ActionCard({
  children,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <article className="rounded-[26px] border border-white/10 bg-white/3 px-5 py-5">
      <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-2xl tracking-[-0.05em] text-white">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function ActionHint({
  className,
  message,
}: {
  className?: string;
  message: string | null;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className={cn("mt-3 text-sm leading-6 text-slate-500", className)}>{message}</p>
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

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/3 px-4 py-4">
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-sm font-medium text-white">{value}</p>
    </article>
  );
}
