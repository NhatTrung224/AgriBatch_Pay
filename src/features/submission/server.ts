import { db } from "@/lib/db";
import { clientEnv } from "@/lib/env/client";

export async function getSubmissionEvidenceSnapshot() {
  return db.query.submissionEvidence.findFirst();
}

export async function getSubmissionSurfaceData() {
  const evidence = await getSubmissionEvidenceSnapshot();

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
    repoUrl: evidence?.githubRepoUrl ?? "Pending",
  };
}
