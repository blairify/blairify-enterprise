"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { db } from "@/db/client";
import { publicInterviewLinks } from "@/db/schema/auth";
import { requirePermission } from "@/lib/permissions";
import { requireAuth } from "@/lib/server-auth";
import {
  type CreatePublicInterviewLinkRequest,
  createPublicInterviewLinkSchema,
} from "@/lib/validation/public-interviews";

export type CreatePublicInterviewLinkFormState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: Partial<
    Record<keyof CreatePublicInterviewLinkRequest, string[]>
  >;
  linkId?: string;
  publicUrl?: string;
  publicId?: string;
};

function zodErrorToFieldErrors(
  error: ZodError<CreatePublicInterviewLinkRequest>,
): Partial<Record<keyof CreatePublicInterviewLinkRequest, string[]>> {
  const fieldErrors: Partial<
    Record<keyof CreatePublicInterviewLinkRequest, string[]>
  > = {};

  for (const issue of error.issues) {
    const pathKey = issue.path[0];

    if (typeof pathKey !== "string") {
      continue;
    }

    const key = pathKey as keyof CreatePublicInterviewLinkRequest;

    if (!fieldErrors[key]) {
      fieldErrors[key] = [];
    }

    fieldErrors[key]?.push(issue.message);
  }

  return fieldErrors;
}

function randomPublicId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

function publicUrlForId(publicId: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (typeof base === "string" && base.length > 0) {
    return `${base.replace(/\/$/, "")}/i/${publicId}`;
  }

  return `/i/${publicId}`;
}

const initialState: CreatePublicInterviewLinkFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

export async function createPublicInterviewLinkAction(
  _prevState: CreatePublicInterviewLinkFormState,
  formData: FormData,
): Promise<CreatePublicInterviewLinkFormState> {
  const rawTitle = formData.get("title");
  const rawPlan = formData.get("plan");

  let plan: unknown;

  if (typeof rawPlan === "string" && rawPlan.length > 0) {
    try {
      plan = JSON.parse(rawPlan) as unknown;
    } catch {
      return {
        status: "error",
        message: "Invalid interview plan payload.",
        fieldErrors: {},
      };
    }
  }

  const parsed = createPublicInterviewLinkSchema.safeParse({
    title: rawTitle,
    plan,
  });

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
      message: "You do not have permission to create public interview links.",
      fieldErrors: {},
    };
  }

  const values = parsed.data;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const publicId = randomPublicId();

    const inserted = await db
      .insert(publicInterviewLinks)
      .values({
        enterpriseId: auth.enterprise.id,
        recruiterId: auth.user.id,
        publicId,
        title: values.title,
        plan: values.plan,
      })
      .onConflictDoNothing({
        target: publicInterviewLinks.publicId,
      })
      .returning();

    const row = inserted[0];

    if (!row) {
      continue;
    }

    revalidatePath("/build-interview");

    return {
      status: "success",
      message: "Public link created.",
      fieldErrors: {},
      linkId: row.id,
      publicId,
      publicUrl: publicUrlForId(publicId),
    };
  }

  return {
    ...initialState,
    status: "error",
    message: "Unable to create a public link. Please try again.",
  };
}

export async function getPublicInterviewLinksForEnterprise() {
  const auth = await requireAuth();

  try {
    requirePermission(auth.user, "manage_candidates");
  } catch {
    return [];
  }

  return db
    .select()
    .from(publicInterviewLinks)
    .where(eq(publicInterviewLinks.enterpriseId, auth.enterprise.id))
    .orderBy(desc(publicInterviewLinks.createdAt));
}
