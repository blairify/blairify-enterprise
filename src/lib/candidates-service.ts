import "server-only";

import { withEnterpriseDb } from "@/db/client";
import type { Candidate } from "@/db/schema/auth";
import { candidates } from "@/db/schema/auth";
import type { CreateCandidateRequest } from "@/lib/validation/candidates";

export type CreateCandidateServiceResponse = {
  ok: true;
  value: Candidate;
};

export async function createCandidate(
  enterpriseId: string,
  input: CreateCandidateRequest,
): Promise<CreateCandidateServiceResponse> {
  return withEnterpriseDb(enterpriseId, async (tenantDb) => {
    const [candidate] = await tenantDb
      .insert(candidates)
      .values({
        enterpriseId,
        fullName: input.fullName,
        email: input.email,
        headline: input.headline,
        location: input.location,
        seniority: input.seniority,
        currentCompany: input.currentCompany,
        linkedInUrl: input.linkedInUrl,
        githubUrl: input.githubUrl,
        cvUrl: input.cvUrl,
        notes: input.notes,
      })
      .returning();

    if (!candidate) {
      throw new Error("Failed to create candidate");
    }

    return { ok: true, value: candidate };
  });
}
