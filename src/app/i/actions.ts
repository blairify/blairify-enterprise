"use server";

import "server-only";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db, withEnterpriseDb } from "@/db/client";
import {
  publicInterviewAttempts,
  publicInterviewCandidates,
  publicInterviewLinks,
} from "@/db/schema/auth";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import {
  type PublicInterviewCandidateIntakeRequest,
  publicInterviewCandidateIntakeSchema,
} from "@/lib/validation/public-interviews";

export type PublicInterviewIntakeFormState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: Partial<
    Record<keyof PublicInterviewCandidateIntakeRequest, string[]>
  >;
  attemptUrl?: string;
};

const initialState: PublicInterviewIntakeFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

function firstIssueKey(
  issuePath: unknown[],
): keyof PublicInterviewCandidateIntakeRequest | null {
  const key = issuePath[0];
  if (typeof key !== "string") return null;

  const allowed: (keyof PublicInterviewCandidateIntakeRequest)[] = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "location",
    "cvFile",
  ];

  if (allowed.includes(key as keyof PublicInterviewCandidateIntakeRequest)) {
    return key as keyof PublicInterviewCandidateIntakeRequest;
  }

  return null;
}

function zodToFieldErrors(error: {
  issues: { path: unknown[]; message: string }[];
}): Partial<Record<keyof PublicInterviewCandidateIntakeRequest, string[]>> {
  const out: Partial<
    Record<keyof PublicInterviewCandidateIntakeRequest, string[]>
  > = {};

  for (const issue of error.issues) {
    const key = firstIssueKey(issue.path);
    if (!key) continue;

    if (!out[key]) out[key] = [];
    out[key]?.push(issue.message);
  }

  return out;
}

function attemptPath(publicId: string, attemptId: string): string {
  return `/i/${publicId}/attempt/${attemptId}`;
}

export async function submitPublicInterviewIntakeAction(
  publicId: string,
  _prevState: PublicInterviewIntakeFormState,
  formData: FormData,
): Promise<PublicInterviewIntakeFormState> {
  try {
    await enforceRateLimit("public_interview_intake");
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

  const link = await db
    .select()
    .from(publicInterviewLinks)
    .where(eq(publicInterviewLinks.publicId, publicId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!link) {
    return {
      status: "error",
      message: "This interview link is invalid or expired.",
      fieldErrors: {},
    };
  }

  const rawCv = formData.get("cvFile");
  const cvFile = rawCv instanceof File && rawCv.size > 0 ? rawCv : undefined;

  const rawValues: PublicInterviewCandidateIntakeRequest = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    location: String(formData.get("location") ?? ""),
    cvFile,
  };

  const parsed = publicInterviewCandidateIntakeSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted errors and try again.",
      fieldErrors: zodToFieldErrors(parsed.error),
    };
  }

  const values = parsed.data;
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const email = values.email.trim().toLowerCase();
  const phone = values.phone.trim();
  const location = values.location.trim();
  let cvBase64: string | null = null;
  let cvSizeBytes: number | null = null;
  let cvFileName: string | null = null;
  let cvMime: string | null = null;

  if (values.cvFile) {
    const bytes = Buffer.from(await values.cvFile.arrayBuffer());
    cvBase64 = bytes.toString("base64");
    cvSizeBytes = values.cvFile.size;
    cvFileName = values.cvFile.name;
    cvMime = values.cvFile.type;
  }

  const attempt = await withEnterpriseDb(
    link.enterpriseId,
    async (tenantDb) => {
      const insertedCandidate = await tenantDb
        .insert(publicInterviewCandidates)
        .values({
          enterpriseId: link.enterpriseId,
          publicInterviewLinkId: link.id,
          firstName,
          lastName,
          email,
          phone,
          location,
          cvBase64,
          cvSizeBytes,
          cvFileName,
          cvMime,
        })
        .onConflictDoNothing({
          target: [
            publicInterviewCandidates.publicInterviewLinkId,
            publicInterviewCandidates.email,
          ],
        })
        .returning();

      const candidate =
        insertedCandidate[0] ??
        (await tenantDb
          .select()
          .from(publicInterviewCandidates)
          .where(
            and(
              eq(publicInterviewCandidates.publicInterviewLinkId, link.id),
              eq(publicInterviewCandidates.email, email),
            ),
          )
          .limit(1)
          .then((rows) => rows[0] ?? null));

      if (!candidate) {
        return null;
      }

      const insertedAttempt = await tenantDb
        .insert(publicInterviewAttempts)
        .values({
          enterpriseId: link.enterpriseId,
          publicInterviewLinkId: link.id,
          candidateId: candidate.id,
          status: "started",
        })
        .onConflictDoNothing({
          target: [
            publicInterviewAttempts.publicInterviewLinkId,
            publicInterviewAttempts.candidateId,
          ],
        })
        .returning();

      const attempt =
        insertedAttempt[0] ??
        (await tenantDb
          .select()
          .from(publicInterviewAttempts)
          .where(
            and(
              eq(publicInterviewAttempts.publicInterviewLinkId, link.id),
              eq(publicInterviewAttempts.candidateId, candidate.id),
            ),
          )
          .limit(1)
          .then((rows) => rows[0] ?? null));

      return attempt ?? null;
    },
  );

  if (!attempt) {
    return {
      ...initialState,
      status: "error",
      message: "Unable to start interview attempt. Please try again.",
    };
  }

  revalidatePath(`/dashboard/public-interviews`);

  return {
    status: "success",
    message: null,
    fieldErrors: {},
    attemptUrl: attemptPath(publicId, attempt.id),
  };
}
