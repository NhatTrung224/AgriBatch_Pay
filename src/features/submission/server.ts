import { db } from "@/lib/db";
import { clientEnv } from "@/lib/env/client";
import { count, countDistinct } from "drizzle-orm";
import { appEvents, walletInteractions } from "@/lib/db/schema";

export async function getSubmissionEvidenceSnapshot() {
  return db.query.submissionEvidence.findFirst();
}

export async function getSubmissionSurfaceData() {
  const [evidence, walletProof, eventProof] = await Promise.all([
    getSubmissionEvidenceSnapshot(),
    db
      .select({
        distinctWallets: countDistinct(walletInteractions.publicKey),
        interactions: count(),
      })
      .from(walletInteractions),
    db.select({ events: count() }).from(appEvents),
  ]);

  return {
    contractAddresses: {
      payoutVault:
        evidence?.payoutVaultContractAddress ||
        clientEnv.NEXT_PUBLIC_PAYOUT_VAULT_CONTRACT_ID ||
        "Pending",
      registry:
        evidence?.registryContractAddress ||
        clientEnv.NEXT_PUBLIC_REGISTRY_CONTRACT_ID ||
        "Pending",
    },
    evidence: evidence ?? null,
    healthcheckUrl: "/api/health",
    proofMetrics: {
      appEvents: eventProof[0]?.events ?? 0,
      distinctWallets: walletProof[0]?.distinctWallets ?? 0,
      walletInteractions: walletProof[0]?.interactions ?? 0,
    },
    repoUrl: evidence?.githubRepoUrl ?? "Pending",
  };
}
