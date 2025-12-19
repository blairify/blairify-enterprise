"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/client";
import { publicInterviewLinks } from "@/db/schema/auth";
import { requirePermission } from "@/lib/permissions";
import { requireAuth } from "@/lib/server-auth";

export type UpdatePublicInterviewQuestionsFormState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

type QuestionInput = {
  id: string;
  prompt: string;
  title?: string;
};

function parseQuestions(value: unknown): QuestionInput[] | null {
  if (!Array.isArray(value)) return null;

  const out: QuestionInput[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") return null;

    const id = (item as { id?: unknown }).id;
    const prompt = (item as { prompt?: unknown }).prompt;
    const title = (item as { title?: unknown }).title;

    if (typeof id !== "string" || id.trim().length === 0) return null;
    if (typeof prompt !== "string" || prompt.trim().length === 0) return null;

    out.push({
      id: id.trim(),
      prompt: prompt.trim(),
      title:
        typeof title === "string" && title.trim().length > 0
          ? title.trim()
          : undefined,
    });
  }

  return out;
}

export async function updatePublicInterviewQuestionsAction(
  _prevState: UpdatePublicInterviewQuestionsFormState,
  formData: FormData,
): Promise<UpdatePublicInterviewQuestionsFormState> {
  const auth = await requireAuth();

  try {
    requirePermission(auth.user, "manage_candidates");
  } catch {
    return { status: "error", message: "You do not have access." };
  }

  const linkId = String(formData.get("linkId") ?? "").trim();
  const raw = formData.get("questions");

  if (!linkId) {
    return { status: "error", message: "Missing link id." };
  }

  if (typeof raw !== "string") {
    return { status: "error", message: "Invalid questions payload." };
  }

  let parsed: unknown = null;

  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return { status: "error", message: "Invalid questions JSON." };
  }

  const questions = parseQuestions(parsed);

  if (!questions) {
    return { status: "error", message: "Invalid questions." };
  }

  const current = await db
    .select({ plan: publicInterviewLinks.plan })
    .from(publicInterviewLinks)
    .where(
      and(
        eq(publicInterviewLinks.id, linkId),
        eq(publicInterviewLinks.enterpriseId, auth.enterprise.id),
      ),
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!current) {
    return { status: "error", message: "Link not found." };
  }

  const basePlan =
    current.plan && typeof current.plan === "object" ? current.plan : {};
  const nextPlan = { ...(basePlan as Record<string, unknown>), questions };

  await db
    .update(publicInterviewLinks)
    .set({ plan: nextPlan })
    .where(
      and(
        eq(publicInterviewLinks.id, linkId),
        eq(publicInterviewLinks.enterpriseId, auth.enterprise.id),
      ),
    );

  revalidatePath("/dashboard/public-interviews");
  revalidatePath(`/dashboard/public-interviews/${linkId}`);

  return { status: "success", message: "Questions updated." };
}
