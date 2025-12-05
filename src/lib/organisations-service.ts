import "server-only";

import { and, eq } from "drizzle-orm";

import { withEnterpriseDb } from "@/db/client";
import type { Organisation } from "@/db/schema/auth";
import { organisations } from "@/db/schema/auth";
import type { CreateOrganisationRequest } from "@/lib/validation/organisations";

export type CreateOrganisationServiceError = "ORGANISATION_NAME_EXISTS";

export type CreateOrganisationServiceResponse =
  | { ok: true; value: Organisation }
  | { ok: false; error: CreateOrganisationServiceError; message: string };

export async function createOrganisation(
  enterpriseId: string,
  input: CreateOrganisationRequest,
): Promise<CreateOrganisationServiceResponse> {
  return withEnterpriseDb(enterpriseId, async (tenantDb) => {
    const existing = await tenantDb
      .select({ id: organisations.id })
      .from(organisations)
      .where(
        and(
          eq(organisations.enterpriseId, enterpriseId),
          eq(organisations.name, input.name),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return {
        ok: false,
        error: "ORGANISATION_NAME_EXISTS",
        message: "An organisation with this name already exists.",
      };
    }

    const [organisation] = await tenantDb
      .insert(organisations)
      .values({
        enterpriseId,
        name: input.name,
        description: input.description,
        industry: input.industry,
        location: input.location,
        size: input.size,
        website: input.website,
        hiringFocus: input.hiringFocus,
      })
      .returning();

    if (!organisation) {
      throw new Error("Failed to create organisation");
    }

    return { ok: true, value: organisation };
  });
}
