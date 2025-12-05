"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { withEnterpriseDb } from "@/db/client";
import { organisations } from "@/db/schema/auth";
import { createOrganisation } from "@/lib/organisations-service";
import { requirePermission } from "@/lib/permissions";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/server-auth";
import {
  type CreateOrganisationRequest,
  createOrganisationSchema,
} from "@/lib/validation/organisations";

export type CreateOrganisationFormValues = CreateOrganisationRequest;

export type CreateOrganisationFormState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: Partial<Record<keyof CreateOrganisationFormValues, string[]>>;
};

function zodErrorToFieldErrors(
  error: ZodError<CreateOrganisationFormValues>,
): Partial<Record<keyof CreateOrganisationFormValues, string[]>> {
  const fieldErrors: Partial<
    Record<keyof CreateOrganisationFormValues, string[]>
  > = {};

  for (const issue of error.issues) {
    const pathKey = issue.path[0];

    if (typeof pathKey !== "string") {
      continue;
    }

    const key = pathKey as keyof CreateOrganisationFormValues;

    if (!fieldErrors[key]) {
      fieldErrors[key] = [];
    }

    fieldErrors[key]?.push(issue.message);
  }

  return fieldErrors;
}

export async function createOrganisationAction(
  _prevState: CreateOrganisationFormState,
  formData: FormData,
): Promise<CreateOrganisationFormState> {
  try {
    await enforceRateLimit("create_organisation_form");
  } catch (error) {
    if (error instanceof RateLimitError) {
      return {
        status: "error",
        message: "Too many attempts. Please try again later.",
        fieldErrors: {},
      };
    }
    throw error;
  }

  const rawValues = {
    name: formData.get("name"),
    description: formData.get("description"),
    industry: formData.get("industry"),
    location: formData.get("location"),
    size: formData.get("size"),
    website: formData.get("website"),
    hiringFocus: formData.get("hiringFocus"),
  };

  const parsed = createOrganisationSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted errors and try again.",
      fieldErrors: zodErrorToFieldErrors(parsed.error),
    };
  }

  const auth = await requireAuth();

  try {
    requirePermission(auth.user, "manage_organisations");
  } catch {
    return {
      status: "error",
      message: "You do not have permission to manage organisations.",
      fieldErrors: {},
    };
  }

  const values = parsed.data;

  const result = await createOrganisation(auth.enterprise.id, values);

  if (!result.ok) {
    switch (result.error) {
      case "ORGANISATION_NAME_EXISTS": {
        return {
          status: "error",
          message: result.message,
          fieldErrors: {
            name: [result.message],
          },
        };
      }
      default: {
        const _never: never = result.error;
        throw new Error(`Unhandled create organisation error: ${_never}`);
      }
    }
  }

  return {
    status: "success",
    message: "Organisation created successfully.",
    fieldErrors: {},
  };
}

export async function deleteOrganisationAction(
  formData: FormData,
): Promise<void> {
  try {
    await enforceRateLimit("delete_organisation_form");
  } catch (error) {
    if (error instanceof RateLimitError) {
      return;
    }
    throw error;
  }

  const auth = await requireAuth();

  try {
    requirePermission(auth.user, "manage_organisations");
  } catch {
    return;
  }

  const rawId = formData.get("organisationId");

  if (typeof rawId !== "string" || rawId.length === 0) {
    return;
  }

  await withEnterpriseDb(auth.enterprise.id, async (tenantDb) => {
    await tenantDb
      .delete(organisations)
      .where(
        and(
          eq(organisations.enterpriseId, auth.enterprise.id),
          eq(organisations.id, rawId),
        ),
      );
  });

  revalidatePath("/organisations");
}
