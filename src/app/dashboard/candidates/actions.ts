"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { withEnterpriseDb } from "@/db/client";
import { candidates } from "@/db/schema/auth";
import { createCandidate } from "@/lib/candidates-service";
import { requirePermission } from "@/lib/permissions";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/server-auth";
import {
  type CreateCandidateRequest,
  createCandidateSchema,
} from "@/lib/validation/candidates";

export type CreateCandidateFormValues = CreateCandidateRequest;

export type CreateCandidateFormState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: Partial<Record<keyof CreateCandidateFormValues, string[]>>;
};

function zodErrorToFieldErrors(
  error: ZodError<CreateCandidateFormValues>,
): Partial<Record<keyof CreateCandidateFormValues, string[]>> {
  const fieldErrors: Partial<
    Record<keyof CreateCandidateFormValues, string[]>
  > = {};

  for (const issue of error.issues) {
    const pathKey = issue.path[0];

    if (typeof pathKey !== "string") {
      continue;
    }

    const key = pathKey as keyof CreateCandidateFormValues;

    if (!fieldErrors[key]) {
      fieldErrors[key] = [];
    }

    fieldErrors[key]?.push(issue.message);
  }

  return fieldErrors;
}

export async function createCandidateAction(
  _prevState: CreateCandidateFormState,
  formData: FormData,
): Promise<CreateCandidateFormState> {
  try {
    await enforceRateLimit("create_candidate_form");
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

  const normalizeOptional = (value: FormDataEntryValue | null) => {
    if (typeof value !== "string") {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const rawValues = {
    fullName: formData.get("fullName"),
    email: normalizeOptional(formData.get("email")),
    headline: normalizeOptional(formData.get("headline")),
    location: normalizeOptional(formData.get("location")),
    seniority: normalizeOptional(formData.get("seniority")),
    currentCompany: normalizeOptional(formData.get("currentCompany")),
    linkedInUrl: normalizeOptional(formData.get("linkedInUrl")),
    githubUrl: normalizeOptional(formData.get("githubUrl")),
    cvUrl: normalizeOptional(formData.get("cvUrl")),
    notes: normalizeOptional(formData.get("notes")),
  };

  const parsed = createCandidateSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted errors and try again.",
      fieldErrors: zodErrorToFieldErrors(parsed.error),
    };
  }

  const auth = await requireAuth();

  try {
    requirePermission(auth.user, "manage_candidates");
  } catch {
    return {
      status: "error",
      message: "You do not have permission to manage candidates.",
      fieldErrors: {},
    };
  }

  const values = parsed.data;

  await createCandidate(auth.enterprise.id, values);

  return {
    status: "success",
    message: "Candidate added successfully.",
    fieldErrors: {},
  };
}

export async function deleteCandidateAction(formData: FormData): Promise<void> {
  try {
    await enforceRateLimit("delete_candidate_form");
  } catch (error) {
    if (error instanceof RateLimitError) {
      return;
    }
    throw error;
  }

  const auth = await requireAuth();

  try {
    requirePermission(auth.user, "manage_candidates");
  } catch {
    return;
  }

  const rawId = formData.get("candidateId");

  if (typeof rawId !== "string" || rawId.length === 0) {
    return;
  }

  await withEnterpriseDb(auth.enterprise.id, async (tenantDb) => {
    await tenantDb
      .delete(candidates)
      .where(
        and(
          eq(candidates.enterpriseId, auth.enterprise.id),
          eq(candidates.id, rawId),
        ),
      );
  });

  revalidatePath("/candidates");
}
