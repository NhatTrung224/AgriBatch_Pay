"use client";

import {
  CheckCircle,
  Plant,
  Plug,
  ShieldCheck,
  Storefront,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NetworkBadge } from "@/features/wallets/components/network-badge";
import { WalletProviderBadge } from "@/features/wallets/components/wallet-provider-badge";
import { walletOptions } from "@/features/wallets/constants";
import { freighterAdapter } from "@/features/wallets/lib/freighter-adapter";
import { rabetAdapter } from "@/features/wallets/lib/rabet-adapter";
import type { WalletProvider } from "@/features/wallets/types";
import type { UserRole } from "@/types/domain";

const roleOptions: Array<{
  description: string;
  icon: typeof Plant;
  label: string;
  value: UserRole;
}> = [
  {
    value: "FARMER",
    label: "Farmer",
    description: "Track lots, expected payouts, and settlement receipts.",
    icon: Plant,
  },
  {
    value: "COOPERATIVE",
    label: "Cooperative",
    description: "Create crop batches, add lots, and confirm quality gates.",
    icon: UsersThree,
  },
  {
    value: "BUYER",
    label: "Buyer",
    description: "Fund payout vaults and approve final settlement release.",
    icon: Storefront,
  },
  {
    value: "AUDITOR",
    label: "Auditor",
    description: "Inspect timelines, tx proofs, and audit event feeds.",
    icon: ShieldCheck,
  },
];

type WalletInstallState = Record<WalletProvider, boolean | null>;

export function OnboardingWorkspace() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("BUYER");
  const [selectedProvider, setSelectedProvider] =
    useState<WalletProvider>("freighter");
  const [connectedPublicKey, setConnectedPublicKey] = useState("");
  const [connectedNetwork, setConnectedNetwork] = useState("Stellar Testnet");
  const [isConnecting, setIsConnecting] = useState(false);
  const [installedProviders, setInstalledProviders] =
    useState<WalletInstallState>({
      freighter: null,
      rabet: null,
    });

  useEffect(() => {
    let cancelled = false;

    async function checkWallets() {
      const [freighter, rabet] = await Promise.all([
        freighterAdapter.isInstalled().catch(() => false),
        rabetAdapter.isInstalled().catch(() => false),
      ]);

      if (!cancelled) {
        setInstalledProviders({ freighter, rabet });
      }
    }

    void checkWallets();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeWallet = walletOptions.find(
    (wallet) => wallet.provider === selectedProvider,
  );
  const isInstalled = activeWallet
    ? installedProviders[activeWallet.provider]
    : false;

  async function handleContinue() {
    if (!activeWallet) {
      return;
    }

    const adapter =
      selectedProvider === "freighter" ? freighterAdapter : rabetAdapter;

    try {
      setIsConnecting(true);
      const connection = await adapter.connect();

      setConnectedNetwork(connection.network ?? "Stellar Testnet");
      setConnectedPublicKey(connection.publicKey);

      toast.success(`${activeWallet.label} connected successfully.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Unable to connect ${activeWallet.label}.`;
      toast.error(message);
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="panel px-5 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-slate-300">
              Wallet onboarding
            </span>
            <h1 className="mt-4 font-display text-[3rem] tracking-[-0.06em] text-white">
              Choose a role and wallet before entering the settlement workspace.
            </h1>
          </div>
          <NetworkBadge />
        </div>

        <div className="mt-8 space-y-8">
          <section>
            <div className="mb-4 flex items-center gap-3">
              <Wallet size={20} className="text-accent" />
              <h2 className="font-display text-2xl tracking-[-0.04em] text-white">
                Select role
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {roleOptions.map(({ description, icon: Icon, label, value }) => {
                const active = selectedRole === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedRole(value)}
                    className={cn(
                      "rounded-[24px] border px-4 py-5 text-left transition duration-200",
                      active
                        ? "border-emerald-200/18 bg-emerald-300/10 shadow-[0_24px_50px_rgba(4,12,10,0.26)]"
                        : "border-white/10 bg-white/3 hover:border-white/16 hover:bg-white/5",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-12 items-center justify-center rounded-2xl border",
                        active
                          ? "border-emerald-200/18 bg-emerald-300/14 text-accent"
                          : "border-white/10 bg-white/5 text-slate-300",
                      )}
                    >
                      <Icon size={22} weight={active ? "duotone" : "regular"} />
                    </span>
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-medium text-white">{label}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-400">
                          {description}
                        </p>
                      </div>
                      {active ? (
                        <CheckCircle size={20} weight="fill" className="text-accent" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-3">
              <Plug size={20} className="text-cyan-100" />
              <h2 className="font-display text-2xl tracking-[-0.04em] text-white">
                Select wallet
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {walletOptions.map((wallet) => {
                const active = selectedProvider === wallet.provider;
                const installed = installedProviders[wallet.provider];

                return (
                  <button
                    key={wallet.provider}
                    type="button"
                    onClick={() => setSelectedProvider(wallet.provider)}
                    className={cn(
                      "rounded-[24px] border px-4 py-5 text-left transition duration-200",
                      active
                        ? "border-cyan-300/18 bg-cyan-300/10 shadow-[0_24px_50px_rgba(4,12,10,0.26)]"
                        : "border-white/10 bg-white/3 hover:border-white/16 hover:bg-white/5",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <WalletProviderBadge provider={wallet.provider} />
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em]",
                          installed
                            ? "border border-emerald-200/18 bg-emerald-300/10 text-emerald-100"
                            : installed === null
                              ? "border border-slate-300/18 bg-slate-300/10 text-slate-100"
                            : "border border-amber-300/18 bg-amber-300/10 text-amber-100",
                        )}
                      >
                        {installed === null
                          ? "Checking"
                          : installed
                            ? "Installed"
                            : "Not installed"}
                      </span>
                    </div>
                    <h3 className="mt-5 text-2xl font-medium text-white">
                      {wallet.label}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-400">
                      {wallet.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </section>

      <aside className="grid gap-4">
        <section className="panel px-5 py-6 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
              Connection profile
            </p>
            <WalletProviderBadge provider={selectedProvider} compact />
          </div>
          <div className="mt-5 space-y-4">
            <MetricRow label="Selected role" value={selectedRole} />
            <MetricRow
              label="Wallet status"
              value={
                connectedPublicKey
                  ? "Connected"
                  : isInstalled === null
                    ? "Checking extension"
                    : isInstalled
                      ? "Ready to connect"
                      : "Extension missing"
              }
            />
            <MetricRow
              label="Public key"
              value={connectedPublicKey || "Pending connection"}
              mono
            />
            <MetricRow label="Network" value={connectedNetwork} />
          </div>
          <Button className="mt-6 w-full" onClick={handleContinue} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect wallet"}
          </Button>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Freighter now performs a real extension handshake with network
            checks. Rabet uses the extension browser API and assumes the app&apos;s
            configured network when signing.
          </p>
        </section>

        <section className="panel px-5 py-6 lg:px-6">
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
            Validation expectations
          </p>
          <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-400">
            <li className="flex gap-3">
              <CheckCircle size={18} className="mt-1 text-accent" weight="duotone" />
              Freighter and Rabet must surface installation state cleanly.
            </li>
            <li className="flex gap-3">
              <CheckCircle size={18} className="mt-1 text-accent" weight="duotone" />
              Wrong network and user rejection will show toast-driven error
              paths instead of breaking the page.
            </li>
            <li className="flex gap-3">
              <CheckCircle size={18} className="mt-1 text-accent" weight="duotone" />
              Selected role will scope downstream dashboard actions and flows.
            </li>
          </ul>
        </section>
      </aside>
    </div>
  );
}

function MetricRow({
  label,
  mono = false,
  value,
}: {
  label: string;
  mono?: boolean;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-white/4 px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span
        className={cn(
          "text-sm font-medium text-white",
          mono && "max-w-[18ch] truncate font-mono text-xs uppercase tracking-[0.12em]",
        )}
      >
        {value}
      </span>
    </div>
  );
}
