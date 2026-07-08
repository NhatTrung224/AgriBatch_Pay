import { SubmissionChecklist } from "@/features/submission/components/submission-checklist";
import { getSubmissionSurfaceData } from "@/features/submission/server";

export const dynamic = "force-dynamic";

export default async function SubmissionPage() {
  const surface = await getSubmissionSurfaceData();

  return (
    <SubmissionChecklist
      contractAddresses={surface.contractAddresses}
      evidence={surface.evidence}
      healthcheckUrl={surface.healthcheckUrl}
      proofMetrics={surface.proofMetrics}
      repoUrl={surface.repoUrl}
    />
  );
}
