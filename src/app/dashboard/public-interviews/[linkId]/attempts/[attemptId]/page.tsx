import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Typography } from "@/components/common/atoms/typography";
import { DashboardLayout } from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db, withEnterpriseDb } from "@/db/client";
import {
  publicInterviewAttempts,
  publicInterviewCandidates,
  publicInterviewLinks,
} from "@/db/schema/auth";
import { getInterviewerById } from "@/lib/config/interviewers";
import { hasPermission, requirePermission } from "@/lib/permissions";
import { requireAuth } from "@/lib/server-auth";

export const metadata = {
  title: "Attempt results | Blairify Enterprise",
  robots: {
    index: false,
    follow: false,
  },
};

interface AttemptAnalysis {
  decision: "PASS" | "FAIL";
  overallScore: number;
  hireRecommendation: "strong_no" | "no" | "maybe" | "yes" | "strong_yes";
  summary: string;
  strengths: string[];
  concerns: string[];
  nextSteps: string[];
}

function parseAnalysis(raw: unknown): AttemptAnalysis | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (
    typeof obj.decision !== "string" ||
    typeof obj.overallScore !== "number" ||
    typeof obj.hireRecommendation !== "string" ||
    typeof obj.summary !== "string" ||
    !Array.isArray(obj.strengths) ||
    !Array.isArray(obj.concerns) ||
    !Array.isArray(obj.nextSteps)
  ) {
    return null;
  }
  return {
    decision: obj.decision as "PASS" | "FAIL",
    overallScore: obj.overallScore,
    hireRecommendation: obj.hireRecommendation as
      | "strong_no"
      | "no"
      | "maybe"
      | "yes"
      | "strong_yes",
    summary: obj.summary,
    strengths: obj.strengths as string[],
    concerns: obj.concerns as string[],
    nextSteps: obj.nextSteps as string[],
  };
}

function scoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 80) return "text-green-500";
  if (score >= 70) return "text-yellow-500";
  if (score >= 60) return "text-orange-500";
  return "text-red-500";
}

function hireVariant(
  rec: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (rec) {
    case "strong_yes":
    case "yes":
      return "default";
    case "maybe":
      return "secondary";
    case "no":
    case "strong_no":
      return "destructive";
    default:
      return "outline";
  }
}

function hireLabel(rec: string): string {
  switch (rec) {
    case "strong_yes":
      return "Strong yes";
    case "yes":
      return "Yes";
    case "maybe":
      return "Maybe";
    case "no":
      return "No";
    case "strong_no":
      return "Strong no";
    default:
      return rec;
  }
}

export default async function AttemptResultPage({
  params,
}: {
  params: Promise<{ linkId: string; attemptId: string }>;
}) {
  const { linkId, attemptId } = await params;
  const auth = await requireAuth();
  await requirePermission(auth.user, "manage_candidates");

  const link = await db
    .select({
      id: publicInterviewLinks.id,
      enterpriseId: publicInterviewLinks.enterpriseId,
      title: publicInterviewLinks.title,
      publicId: publicInterviewLinks.publicId,
    })
    .from(publicInterviewLinks)
    .where(eq(publicInterviewLinks.id, linkId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!link || link.enterpriseId !== auth.enterprise.id) {
    notFound();
  }

  const attempt = await withEnterpriseDb(link.enterpriseId, async (tenantDb) =>
    tenantDb
      .select({
        id: publicInterviewAttempts.id,
        status: publicInterviewAttempts.status,
        completedAt: publicInterviewAttempts.completedAt,
        answers: publicInterviewAttempts.answers,
        analysis: publicInterviewAttempts.analysis,
        scores: publicInterviewAttempts.scores,
        interviewerId: publicInterviewAttempts.interviewerId,
        candidateId: publicInterviewAttempts.candidateId,
      })
      .from(publicInterviewAttempts)
      .where(
        and(
          eq(publicInterviewAttempts.id, attemptId),
          eq(publicInterviewAttempts.publicInterviewLinkId, link.id),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null),
  );

  if (!attempt || attempt.status !== "completed") {
    notFound();
  }

  const candidate = await withEnterpriseDb(
    link.enterpriseId,
    async (tenantDb) =>
      tenantDb
        .select({
          firstName: publicInterviewCandidates.firstName,
          lastName: publicInterviewCandidates.lastName,
          email: publicInterviewCandidates.email,
        })
        .from(publicInterviewCandidates)
        .where(eq(publicInterviewCandidates.id, attempt.candidateId))
        .limit(1)
        .then((rows) => rows[0] ?? null),
  );

  if (!candidate) {
    notFound();
  }

  const analysis = parseAnalysis(attempt.analysis);
  const interviewer = attempt.interviewerId
    ? getInterviewerById(attempt.interviewerId)
    : null;

  const storedAnswers =
    typeof attempt.answers === "object" &&
    attempt.answers &&
    "version" in attempt.answers &&
    "qa" in attempt.answers
      ? (attempt.answers as { version: number; qa: unknown[] }).qa
      : [];

  const qa = Array.isArray(storedAnswers)
    ? storedAnswers.map((item: unknown) => {
        if (!item || typeof item !== "object") return null;
        const obj = item as Record<string, unknown>;
        return {
          question: typeof obj.prompt === "string" ? obj.prompt : "",
          answer: typeof obj.answer === "string" ? obj.answer : "",
        };
      })
    : [];

  const userName = auth.user.fullName;
  const userEmail = auth.user.email;
  const enterpriseName = auth.enterprise.name;
  const canManageUsers = hasPermission(auth.user, "manage_users");

  return (
    <DashboardLayout
      userName={userName}
      userEmail={userEmail}
      enterpriseName={enterpriseName}
      canManageUsers={canManageUsers}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/public-interviews/${linkId}`}
            className="text-sm font-medium underline underline-offset-4"
          >
            ← Back to link details
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-4">
              <span>
                {candidate.firstName} {candidate.lastName}
              </span>
              <Badge variant={hireVariant(analysis?.hireRecommendation ?? "")}>
                {analysis
                  ? hireLabel(analysis.hireRecommendation)
                  : "No recommendation"}
              </Badge>
            </CardTitle>
            <Typography.SubCaption className="text-xs text-muted-foreground">
              {candidate.email} • Completed{" "}
              {attempt.completedAt?.toLocaleString()}
              {interviewer ? ` • Interviewer: ${interviewer.name}` : ""}
            </Typography.SubCaption>
          </CardHeader>
          <CardContent className="space-y-6">
            {analysis ? (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <Typography.SubCaption className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Decision
                    </Typography.SubCaption>
                    <Typography.Heading3
                      className={`mt-1 text-2xl font-semibold ${
                        analysis.decision === "PASS"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {analysis.decision}
                    </Typography.Heading3>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <Typography.SubCaption className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Score
                    </Typography.SubCaption>
                    <Typography.Heading3
                      className={`mt-1 text-2xl font-semibold ${scoreColor(analysis.overallScore)}`}
                    >
                      {analysis.overallScore}
                    </Typography.Heading3>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <Typography.SubCaption className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Recommendation
                    </Typography.SubCaption>
                    <Typography.Heading3 className="mt-1 text-lg font-semibold">
                      {hireLabel(analysis.hireRecommendation)}
                    </Typography.Heading3>
                  </div>
                </div>

                <div>
                  <Typography.Heading3 className="text-lg font-semibold">
                    Summary
                  </Typography.Heading3>
                  <Typography.Body className="mt-1 text-sm">
                    {analysis.summary}
                  </Typography.Body>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Typography.Heading3 className="text-lg font-semibold">
                      Strengths
                    </Typography.Heading3>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Typography.Heading3 className="text-lg font-semibold">
                      Concerns
                    </Typography.Heading3>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {analysis.concerns.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-orange-600">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <Typography.Heading3 className="text-lg font-semibold">
                    Next steps
                  </Typography.Heading3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {analysis.nextSteps.map((ns, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{ns}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <Typography.Body className="text-sm text-muted-foreground">
                No analysis available.
              </Typography.Body>
            )}

            <Separator />

            <div>
              <Typography.Heading3 className="text-lg font-semibold">
                Q&A transcript
              </Typography.Heading3>
              <div className="mt-3 space-y-4">
                {qa.map((item, idx) =>
                  item ? (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border/60 bg-muted/10 p-4 space-y-2"
                    >
                      <Typography.SubCaption className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Q{idx + 1}
                      </Typography.SubCaption>
                      <Typography.Body className="text-sm font-medium">
                        {item.question}
                      </Typography.Body>
                      <Typography.Body className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {item.answer}
                      </Typography.Body>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
