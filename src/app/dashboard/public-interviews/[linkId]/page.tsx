import { and, desc, eq } from "drizzle-orm";
import { Typography } from "@/components/common/atoms/typography";
import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db, withEnterpriseDb } from "@/db/client";
import {
  publicInterviewAttempts,
  publicInterviewCandidates,
  publicInterviewLinks,
} from "@/db/schema/auth";
import { hasPermission, requirePermission } from "@/lib/permissions";
import { requireAuth } from "@/lib/server-auth";
import { PublicInterviewAttemptsTable } from "./public-interview-attempts-table";
import { PublicInterviewLinkHeader } from "./public-interview-link-header";
import { PublicInterviewQuestionsPanel } from "./public-interview-questions-panel";

type EditableQuestion = {
  id: string;
  prompt: string;
  title?: string;
};

function readQuestions(plan: unknown): EditableQuestion[] {
  if (!plan || typeof plan !== "object") return [];

  const raw = (plan as { questions?: unknown }).questions;
  if (!Array.isArray(raw)) return [];

  const out: EditableQuestion[] = [];

  for (const [index, item] of raw.entries()) {
    if (!item || typeof item !== "object") continue;

    const id = (item as { id?: unknown }).id;
    const prompt = (item as { prompt?: unknown }).prompt;
    const title = (item as { title?: unknown }).title;

    if (typeof prompt !== "string" || prompt.trim().length === 0) {
      continue;
    }

    out.push({
      id:
        typeof id === "string" && id.trim().length > 0
          ? id.trim()
          : `q-${index + 1}`,
      prompt: prompt.trim(),
      title:
        typeof title === "string" && title.trim().length > 0
          ? title.trim()
          : undefined,
    });
  }

  return out;
}

type HireRecommendation = "strong_no" | "no" | "maybe" | "yes" | "strong_yes";

function parseHireRecommendation(value: unknown): HireRecommendation | null {
  switch (value) {
    case "strong_no":
    case "no":
    case "maybe":
    case "yes":
    case "strong_yes":
      return value;
    default:
      return null;
  }
}

function parseOverallScore(value: unknown): number | null {
  if (typeof value !== "number") return null;
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.min(100, value));
}

function readAttemptScore(attempt: { scores: unknown } | null): {
  overallScore: number | null;
  hireRecommendation: HireRecommendation | null;
} {
  if (!attempt?.scores || typeof attempt.scores !== "object") {
    return { overallScore: null, hireRecommendation: null };
  }

  const overallScore = parseOverallScore(
    (attempt.scores as { overallScore?: unknown }).overallScore,
  );
  const hireRecommendation = parseHireRecommendation(
    (attempt.scores as { hireRecommendation?: unknown }).hireRecommendation,
  );

  return { overallScore, hireRecommendation };
}

export const metadata = {
  title: "Public interview link | Blairify Enterprise",
  robots: { index: false, follow: false },
};

export default async function PublicInterviewLinkDetailPage({
  params,
}: {
  params: Promise<{ linkId: string }>;
}) {
  const auth = await requireAuth();

  try {
    requirePermission(auth.user, "manage_candidates");
  } catch {
    return (
      <DashboardLayout
        userName={auth.user.fullName}
        userEmail={auth.user.email}
        enterpriseName={auth.enterprise.name}
        canManageUsers={hasPermission(auth.user, "manage_users")}
      >
        <Card>
          <CardHeader>
            <CardTitle>Public interview link</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography.Body className="text-sm">
              You do not have access.
            </Typography.Body>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const userName = auth.user.fullName;
  const userEmail = auth.user.email;
  const enterpriseName = auth.enterprise.name;
  const canManageUsers = hasPermission(auth.user, "manage_users");

  const linkId = (await params).linkId;

  const link = await db
    .select()
    .from(publicInterviewLinks)
    .where(
      and(
        eq(publicInterviewLinks.id, linkId),
        eq(publicInterviewLinks.enterpriseId, auth.enterprise.id),
      ),
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!link) {
    return (
      <DashboardLayout
        userName={userName}
        userEmail={userEmail}
        enterpriseName={enterpriseName}
        canManageUsers={canManageUsers}
      >
        <Card>
          <CardHeader>
            <CardTitle>Public interview link</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography.Body className="text-sm">Not found.</Typography.Body>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const { candidates, attempts } = await withEnterpriseDb(
    auth.enterprise.id,
    async (tenantDb) => {
      const [candidates, attempts] = await Promise.all([
        tenantDb
          .select()
          .from(publicInterviewCandidates)
          .where(
            and(
              eq(publicInterviewCandidates.publicInterviewLinkId, link.id),
              eq(publicInterviewCandidates.enterpriseId, auth.enterprise.id),
            ),
          )
          .orderBy(desc(publicInterviewCandidates.createdAt)),
        tenantDb
          .select()
          .from(publicInterviewAttempts)
          .where(
            and(
              eq(publicInterviewAttempts.publicInterviewLinkId, link.id),
              eq(publicInterviewAttempts.enterpriseId, auth.enterprise.id),
            ),
          )
          .orderBy(desc(publicInterviewAttempts.createdAt)),
      ]);

      return { candidates, attempts };
    },
  );

  const attemptByCandidate = new Map(attempts.map((a) => [a.candidateId, a]));
  const completedAttempts = attempts.filter(
    (attempt) => attempt.status === "completed",
  );
  const averageScore =
    completedAttempts.reduce((total, attempt) => {
      const score = readAttemptScore(attempt).overallScore;
      return score !== null ? total + score : total;
    }, 0) /
    (completedAttempts.filter(
      (attempt) => readAttemptScore(attempt).overallScore !== null,
    ).length || 1);

  return (
    <DashboardLayout
      userName={userName}
      userEmail={userEmail}
      enterpriseName={enterpriseName}
      canManageUsers={canManageUsers}
    >
      <Card>
        <CardHeader className="space-y-3">
          <PublicInterviewLinkHeader
            title={link.title}
            publicPath={`/i/${link.publicId}`}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <Typography.SubCaption className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Candidates
              </Typography.SubCaption>
              <Typography.Heading3 className="mt-1 text-2xl font-semibold">
                {candidates.length}
              </Typography.Heading3>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <Typography.SubCaption className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Completed attempts
              </Typography.SubCaption>
              <Typography.Heading3 className="mt-1 text-2xl font-semibold">
                {completedAttempts.length}
              </Typography.Heading3>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <Typography.SubCaption className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Average score
              </Typography.SubCaption>
              <Typography.Heading3 className="mt-1 text-2xl font-semibold">
                {Number.isFinite(averageScore) ? Math.round(averageScore) : "—"}
              </Typography.Heading3>
            </div>
          </div>

          <div className="space-y-6">
            <section className="space-y-3">
              <div>
                <Typography.SubCaption className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Attempts
                </Typography.SubCaption>
                <Typography.Heading3 className="mt-1 text-lg font-semibold">
                  Candidates
                </Typography.Heading3>
              </div>

              {candidates.length === 0 ? (
                <Typography.Body className="text-sm text-muted-foreground">
                  No candidates yet.
                </Typography.Body>
              ) : (
                <PublicInterviewAttemptsTable
                  rows={candidates.map((c) => {
                    const attempt = attemptByCandidate.get(c.id) ?? null;
                    const score = readAttemptScore(attempt);
                    const scoreLabel =
                      attempt?.status === "completed" &&
                      score.overallScore !== null
                        ? `${score.overallScore}${score.hireRecommendation ? ` (${score.hireRecommendation})` : ""}`
                        : undefined;

                    return {
                      candidateName: `${c.firstName} ${c.lastName}`,
                      email: c.email,
                      status: (attempt?.status ?? "started") as
                        | "started"
                        | "completed",
                      completedAtLabel: attempt?.completedAt
                        ? attempt.completedAt.toLocaleString()
                        : undefined,
                      scoreLabel,
                      attemptId: attempt?.id ?? null,
                      linkId: link.id,
                    };
                  })}
                />
              )}
            </section>

            <section className="rounded-3xl border border-border/60 bg-background/80 p-4 shadow-xl shadow-primary/5 backdrop-blur">
              <PublicInterviewQuestionsPanel
                linkId={link.id}
                initialQuestions={readQuestions(link.plan)}
              />
            </section>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
