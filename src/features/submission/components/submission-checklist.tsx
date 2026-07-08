import { CheckCircle, Clock, GitBranch, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

import { TransactionHashLink } from "@/components/transaction-hash-link";

type SubmissionChecklistProps = {
  contractAddresses: {
    payoutVault: string;
    registry: string;
  };
  evidence: {
    ciStatus: string;
    contractInteractionTxHash: string | null;
    demoVideoStatus: string;
    githubRepoUrl: string;
    healthcheckStatus: string;
    liveDemoStatus: string;
    mobileScreenshotStatus: string;
    payoutVaultContractAddress: string | null;
    railwayStatus: string;
    readmeStatus: string;
    registryContractAddress: string | null;
    requiredScreenshotChecklist: string[];
    testOutputSummary: string;
  } | null;
  healthcheckUrl: string;
  proofMetrics: {
    appEvents: number;
    distinctWallets: number;
    walletInteractions: number;
  };
  repoUrl: string;
};

export function SubmissionChecklist({
  contractAddresses,
  evidence,
  healthcheckUrl,
  proofMetrics,
  repoUrl,
}: SubmissionChecklistProps) {
  const cards = [
    {
      label: "README",
      value: evidence?.readmeStatus ?? "Pending",
    },
    {
      label: "CI / CD",
      value: evidence?.ciStatus ?? "Pending",
    },
    {
      label: "Railway",
      value: evidence?.railwayStatus ?? "Pending",
    },
    {
      label: "Healthcheck",
      value: evidence?.healthcheckStatus ?? "Pending",
    },
    {
      label: "50+ Users",
      value: `${proofMetrics.distinctWallets} funded testnet wallets`,
    },
  ];

  return (
    <div className="space-y-4">
      <section className="panel px-5 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-slate-300">
              Submission evidence
            </span>
            <h1 className="mt-4 font-display text-[3rem] tracking-[-0.06em] text-white">
              Screenshot-ready checklist for the final delivery pass.
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/18 bg-emerald-300/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-emerald-100">
            <ShieldCheck size={14} weight="fill" />
            Checklist surfaced from live app data
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-5">
          {cards.map((card) => (
            <article
              key={card.label}
              className="rounded-[24px] border border-white/10 bg-white/3 px-4 py-4"
            >
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
                {card.label}
              </p>
              <p className="mt-3 text-sm font-medium text-white">{card.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="panel px-5 py-6 lg:px-8">
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
            Core submission fields
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <InfoCard
              label="GitHub repository"
              value={repoUrl}
              icon={<GitBranch size={18} className="text-cyan-100" />}
            />
            <InfoCard
              label="Commit target"
              value="24 meaningful commits"
              icon={<CheckCircle size={18} className="text-emerald-100" />}
            />
            <InfoCard
              label="User proof"
              value={`${proofMetrics.distinctWallets} unique wallets / ${proofMetrics.walletInteractions} interactions`}
              icon={<CheckCircle size={18} className="text-emerald-100" />}
            />
            <InfoCard
              label="Activity proof"
              value={`${proofMetrics.appEvents} app events recorded`}
              icon={<CheckCircle size={18} className="text-emerald-100" />}
            />
            <InfoCard
              label="Registry contract"
              value={contractAddresses.registry}
              icon={<Clock size={18} className="text-amber-100" />}
            />
            <InfoCard
              label="Payout vault contract"
              value={contractAddresses.payoutVault}
              icon={<Clock size={18} className="text-amber-100" />}
            />
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/3 px-5 py-5">
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
              Contract interaction tx hash
            </p>
            {evidence?.contractInteractionTxHash ? (
              <TransactionHashLink
                value={evidence.contractInteractionTxHash}
                className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-100"
              />
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-400">
                Pending. This value will populate after a real contract
                interaction is captured.
              </p>
            )}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/3 px-5 py-5">
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
              Test output summary
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {evidence?.testOutputSummary ?? "Pending"}
            </p>
          </div>
        </article>

        <article className="panel px-5 py-6 lg:px-8">
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
            Required screenshots
          </p>
          <ul className="mt-5 space-y-3">
            {(evidence?.requiredScreenshotChecklist ?? []).map((item) => (
              <li
                key={item}
                className="rounded-[20px] border border-white/10 bg-white/3 px-4 py-4 text-sm text-slate-300"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/3 px-5 py-5">
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
              Delivery placeholders
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>Live Demo: {evidence?.liveDemoStatus ?? "Pending"}</p>
              <p>Pitch Deck: /submission/pitch-deck.html</p>
              <p>Demo Video: {evidence?.demoVideoStatus ?? "Pending"}</p>
              <p>Demo Script: /submission/demo-video-script.html</p>
              <p>Mobile screenshot: {evidence?.mobileScreenshotStatus ?? "Pending"}</p>
              <p>Healthcheck URL: {healthcheckUrl}</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/3 px-4 py-4">
      <div className="flex items-center gap-3">
        {icon}
        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>
      </div>
      <p className="mt-4 text-sm font-medium text-white">{value}</p>
    </article>
  );
}
