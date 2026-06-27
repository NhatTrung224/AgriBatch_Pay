import Image from "next/image";
import {
  ArrowsLeftRight,
  Broadcast,
  CheckCircle,
  ClockCountdown,
  Code,
  Coins,
  Database,
  GlobeHemisphereWest,
  Leaf,
  Lock,
  ShieldCheck,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";

import { LandingHeroPreview } from "@/components/marketing/landing-hero-preview";
import { ButtonLink } from "@/components/ui/button-link";

const problemPoints = [
  "Opaque settlements and delayed payouts",
  "Manual reconciliation and paperwork",
  "Disputes over quality and quantities",
  "High fees and slow cross-border transfers",
  "No real-time visibility for stakeholders",
];

const solutionPoints = [
  "On-chain batch tracking with immutable records",
  "Escrowed payout vaults with milestone releases",
  "Multi-party confirmations for quality assurance",
  "Low-cost, fast settlements on Stellar Testnet",
  "Real-time transparency for all stakeholders",
];

const flowSteps = [
  {
    title: "Batch Created",
    description: "Cooperative creates a crop batch with details and expected quantity.",
    icon: Database,
  },
  {
    title: "Vault Funded",
    description: "Buyer funds the payout vault on-chain for the batch amount.",
    icon: Coins,
  },
  {
    title: "Quality Confirmed",
    description: "Auditor confirms quality and quantity on-chain.",
    icon: ShieldCheck,
  },
  {
    title: "Settlement Approved",
    description: "Cooperative approves settlement for the farmers.",
    icon: UsersThree,
  },
  {
    title: "Farmer Paid",
    description: "Payouts are released from the vault to farmers.",
    icon: Wallet,
  },
  {
    title: "Batch Settled",
    description: "Batch is marked settled with an auditable record.",
    icon: CheckCircle,
  },
];

const stellarFeatures = [
  {
    title: "Fast Finality",
    description: "Transactions confirm in ~5 seconds.",
    icon: ClockCountdown,
  },
  {
    title: "Low Fees",
    description: "Fractions of a cent per transaction.",
    icon: Coins,
  },
  {
    title: "Global Reach",
    description: "Built for cross-border payments.",
    icon: GlobeHemisphereWest,
  },
  {
    title: "Built-in Compliance",
    description: "Accounts, permissions & asset controls.",
    icon: ShieldCheck,
  },
  {
    title: "Smart Contract Ready",
    description: "Secure and predictable contract execution.",
    icon: Code,
  },
];

const architectureModules = [
  {
    title: "Batch Registry",
    description: "Stores batch metadata and participants",
    icon: Database,
  },
  {
    title: "Payout Vault",
    description: "Holds buyer funds in escrow",
    icon: Lock,
  },
  {
    title: "Quality Module",
    description: "Records auditor confirmations",
    icon: ShieldCheck,
  },
  {
    title: "Settlement Module",
    description: "Checks conditions and approves settlement",
    icon: UsersThree,
  },
  {
    title: "Payout Module",
    description: "Releases funds to eligible farmers",
    icon: Coins,
  },
  {
    title: "Event Log",
    description: "Emits on-chain events for audit",
    icon: Broadcast,
  },
];

const submissionStatuses = [
  { label: "Batch Created", tx: "9a3f...1b2c", tone: "emerald" },
  { label: "Vault Funded", tx: "f7b2...8d91", tone: "cyan" },
  { label: "Quality Confirmed", tx: "3c91...ab44", tone: "emerald" },
  { label: "Settlement Approved", tx: "6d12...9f33", tone: "cyan" },
  { label: "Farmer Paid", tx: "a81f...ee77", tone: "emerald" },
  { label: "Batch Settled", tx: "2f45...c9aa", tone: "emerald" },
] as const;

const walletCards = [
  {
    title: "Freighter",
    description: "Connect with Freighter browser extension.",
    badge: "F",
    badgeClassName:
      "bg-[linear-gradient(135deg,rgba(86,164,255,0.88),rgba(210,234,255,0.96))] text-[#041122]",
  },
  {
    title: "Rabet",
    description: "Connect with Rabet wallet.",
    badge: "R",
    badgeClassName:
      "bg-[linear-gradient(135deg,rgba(11,11,11,0.95),rgba(54,54,54,0.98))] text-white",
  },
];

export default function HomePage() {
  return (
    <main className="pb-10">
      <section className="mx-auto w-full max-w-[1720px] px-3 pt-3 lg:px-5 lg:pt-5">
        <div className="panel overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 px-5 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-12 items-center justify-center rounded-[18px] border border-emerald-200/20 bg-[linear-gradient(135deg,rgba(140,246,193,0.24),rgba(109,229,255,0.16))] text-emerald-50 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
                <Leaf size={24} weight="duotone" />
              </span>
              <div>
                <p className="font-display text-[2rem] leading-none tracking-[-0.05em] text-white">
                  AgriBatch <span className="text-accent">Pay</span>
                </p>
              </div>
            </div>

            <nav className="hidden items-center gap-8 text-base text-slate-200 lg:flex">
              <a href="#how-it-works" className="transition-colors hover:text-white">
                How it Works
              </a>
              <a href="#why-stellar" className="transition-colors hover:text-white">
                Why Stellar
              </a>
              <a href="#architecture" className="transition-colors hover:text-white">
                Architecture
              </a>
              <a href="#wallets" className="transition-colors hover:text-white">
                Wallets
              </a>
              <a href="#status" className="transition-colors hover:text-white">
                Status
              </a>
            </nav>

            <ButtonLink href="/dashboard" variant="primary">
              Open Dashboard
            </ButtonLink>
          </header>

          <div className="grid gap-0 lg:grid-cols-[0.98fr_1.32fr]">
            <section className="relative overflow-hidden px-5 py-8 lg:min-h-[680px] lg:px-8 lg:py-14">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(140,246,193,0.12),transparent_38%),linear-gradient(180deg,rgba(3,7,6,0.2),rgba(3,7,6,0.78))]" />
              <div className="absolute inset-x-0 bottom-0 h-[48%] overflow-hidden">
                <Image
                  src="/images/hero-field.png"
                  alt="Terraced crop fields"
                  fill
                  className="object-cover object-center opacity-60"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,13,12,0),rgba(6,13,12,0.92)_80%,rgba(6,13,12,0.98))]" />
              </div>
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="space-y-6">
                  <h1 className="max-w-[12ch] font-display text-6xl leading-[0.9] tracking-[-0.08em] text-white lg:text-[5.35rem]">
                    AgriBatch <span className="text-accent">Pay</span>
                  </h1>
                  <div className="max-w-xl space-y-5">
                    <p className="max-w-[12ch] font-display text-3xl leading-[1.04] tracking-[-0.05em] text-white lg:text-[3.55rem]">
                      Transparent Crop Batch Settlement on Stellar Testnet
                    </p>
                    <p className="max-w-[22ch] text-lg leading-8 text-slate-300">
                      Track each crop batch, fund payout vaults, and release
                      farmer payouts with auditable on-chain events.
                    </p>
                  </div>
                </div>

                <div className="mt-12 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href="/dashboard" variant="primary">
                    Open Dashboard
                  </ButtonLink>
                  <ButtonLink href="/onboarding" variant="ghost">
                    Connect Wallet
                  </ButtonLink>
                </div>
              </div>
            </section>

            <section className="border-t border-white/8 px-3 py-3 lg:border-l lg:border-t-0 lg:px-4 lg:py-4">
              <LandingHeroPreview />
            </section>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-4 grid w-full max-w-[1720px] gap-px px-3 lg:mt-5 lg:grid-cols-2 lg:px-5">
        <div className="panel relative overflow-hidden px-5 py-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,193,7,0.08),transparent_30%)]" />
          <div className="relative z-10">
            <SectionHeading
              icon={<ArrowsLeftRight size={24} className="text-amber-300" />}
              title="The Problem"
            />
            <div className="mt-6 grid gap-5 lg:grid-cols-[0.34fr_0.66fr]">
              <div className="relative min-h-[170px] overflow-hidden rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))]">
                <Image
                  src="/images/hero-field.png"
                  alt="Dark agritech texture"
                  fill
                  className="object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,11,0.1),rgba(6,12,11,0.92))]" />
              </div>
              <ul className="space-y-4 text-base text-slate-200">
                {problemPoints.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-2 size-2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(243,197,106,0.5)]" />
                    <span className="leading-7">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="panel relative overflow-hidden px-5 py-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(140,246,193,0.08),transparent_32%)]" />
          <div className="absolute right-0 top-0 hidden h-full w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.12),transparent)] lg:block" />
          <div className="relative z-10">
            <SectionHeading
              icon={<CheckCircle size={24} className="text-accent" />}
              title="Our Solution"
            />
            <ul className="mt-6 space-y-4 text-base text-slate-200">
              {solutionPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-7 items-center justify-center rounded-full border border-emerald-200/16 bg-emerald-300/10 text-accent">
                    <CheckCircle size={16} weight="fill" />
                  </span>
                  <span className="leading-7">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto mt-4 w-full max-w-[1720px] scroll-mt-28 px-3 lg:mt-5 lg:px-5"
      >
        <div className="panel px-5 py-6 lg:px-8 lg:py-8">
          <h2 className="font-display text-[2.4rem] tracking-[-0.05em] text-white">
            How it Works
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-6">
            {flowSteps.map(({ description, icon: Icon, title }, index) => (
              <article key={title} className="relative">
                <div className="mb-5 flex items-center gap-4">
                  <span className="inline-flex size-14 items-center justify-center rounded-full border border-white/14 bg-white/4 text-white shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
                    <Icon size={22} />
                  </span>
                  <span className="font-display text-3xl tracking-[-0.06em] text-accent">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-medium text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="why-stellar"
        className="mx-auto mt-4 w-full max-w-[1720px] scroll-mt-28 px-3 lg:mt-5 lg:px-5"
      >
        <div className="panel px-5 py-6 lg:px-8 lg:py-8">
          <h2 className="font-display text-[2.4rem] tracking-[-0.05em] text-white">
            Why Stellar
          </h2>
          <div className="mt-7 grid gap-4 lg:grid-cols-5">
            {stellarFeatures.map(({ description, icon: Icon, title }) => (
              <article
                key={title}
                className="rounded-[24px] border border-white/10 bg-white/3 px-4 py-5"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-300/10 text-cyan-100">
                  <Icon size={21} />
                </span>
                <h3 className="mt-5 text-xl font-medium text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="architecture"
        className="mx-auto mt-4 w-full max-w-[1720px] scroll-mt-28 px-3 lg:mt-5 lg:px-5"
      >
        <div className="panel px-5 py-6 lg:px-8 lg:py-8">
          <h2 className="font-display text-[2.4rem] tracking-[-0.05em] text-white">
            Smart Contract Architecture
          </h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-6">
            {architectureModules.map(({ description, icon: Icon, title }) => (
              <article
                key={title}
                className="rounded-[24px] border border-emerald-200/20 bg-[linear-gradient(180deg,rgba(140,246,193,0.04),rgba(255,255,255,0.02))] px-4 py-5"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-emerald-200/16 bg-emerald-300/10 text-accent">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 text-xl font-medium text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="wallets"
        className="mx-auto mt-4 grid w-full max-w-[1720px] gap-4 scroll-mt-28 px-3 lg:mt-5 lg:grid-cols-[0.68fr_1.32fr] lg:px-5"
      >
        <div className="panel px-5 py-6 lg:px-8">
          <h2 className="font-display text-[2.2rem] tracking-[-0.05em] text-white">
            Supported Wallets
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Freighter and Rabet both connect through the live onboarding flow,
            where the app checks installation state, requests access, validates
            the Stellar network, and stores the returned public key.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {walletCards.map(({ badge, badgeClassName, description, title }) => (
              <article
                key={title}
                className="rounded-[24px] border border-white/10 bg-white/3 px-4 py-5"
              >
                <span
                  className={`inline-flex size-14 items-center justify-center rounded-[20px] text-3xl font-semibold ${badgeClassName}`}
                >
                  {badge}
                </span>
                <h3 className="mt-4 text-2xl font-medium text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p>
                <ButtonLink href="/onboarding" variant="ghost" className="mt-5 w-full">
                  Connect Wallet
                </ButtonLink>
              </article>
            ))}
          </div>
        </div>

        <div
          id="status"
          className="panel scroll-mt-28 px-5 py-6 lg:px-8"
        >
          <h2 className="font-display text-[2.2rem] tracking-[-0.05em] text-white">
            Submission Status
          </h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-6">
            {submissionStatuses.map(({ label, tone, tx }) => (
              <article
                key={label}
                className="rounded-[24px] border border-white/10 bg-white/3 px-4 py-5"
              >
                <span
                  className={`inline-flex size-12 items-center justify-center rounded-full border ${
                    tone === "cyan"
                      ? "border-cyan-300/18 bg-cyan-300/10 text-cyan-100"
                      : "border-emerald-200/18 bg-emerald-300/10 text-accent"
                  }`}
                >
                  <CheckCircle size={20} weight="duotone" />
                </span>
                <h3 className="mt-4 text-lg font-medium text-white">{label}</h3>
                <p className="mt-3 text-sm text-slate-400">Tx: {tx}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-4 w-full max-w-[1720px] px-3 lg:mt-5 lg:px-5">
        <div className="panel overflow-hidden px-5 py-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <h2 className="font-display text-[2.6rem] tracking-[-0.05em] text-white">
                Ready to Settle Smarter?
              </h2>
              <p className="text-lg leading-8 text-slate-300">
                Join the future of transparent crop settlements on Stellar
                Testnet.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/dashboard" variant="primary">
                Open Dashboard
              </ButtonLink>
              <ButtonLink href="/onboarding" variant="ghost">
                Connect Wallet
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <h2 className="font-display text-[2.4rem] tracking-[-0.05em] text-white">
        {title}
      </h2>
    </div>
  );
}
