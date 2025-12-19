"use client";

import type { AiPositionSummary } from "@/app/dashboard/build-interview/actions";
import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { PlannedQuestion } from "@/lib/test-interview/test-interview-types";
import { CreatePublicInterviewLinkForm } from "./create-public-interview-link-form";

interface TestInterviewPlanPanelProps {
  summary: AiPositionSummary;
  questions: PlannedQuestion[] | null;
  isGenerating: boolean;
  error: string | null;
  isReviewed: boolean;
  onReviewedChange: (next: boolean) => void;
  onGenerate: () => void;
  onStart: () => void;
}

export function TestInterviewPlanPanel({
  summary,
  questions,
  isGenerating,
  error,
  isReviewed,
  onReviewedChange,
  onGenerate,
  onStart,
}: TestInterviewPlanPanelProps) {
  const canStart = Boolean(questions && questions.length > 0 && isReviewed);
  const linkPlan = questions ? { summary, questions } : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test interview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium text-right">{summary.position}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Seniority</span>
            <span className="font-medium text-right">{summary.seniority}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Company profile</span>
            <span className="font-medium text-right">
              {summary.companyProfile}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-medium text-right">{summary.duration}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Stack</span>
            <span className="font-medium text-right">{summary.stack}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating
              ? "Generating questions..."
              : "Generate question plan"}
          </Button>
          <Button type="button" onClick={onStart} disabled={!canStart}>
            Start test interview
          </Button>
        </div>

        {error ? (
          <Typography.Body className="text-xs text-destructive">
            {error}
          </Typography.Body>
        ) : null}

        {questions ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Typography.Body className="text-sm font-medium">
                Questions that will be asked
              </Typography.Body>
              <span className="text-xs text-muted-foreground">
                {questions.length}
              </span>
            </div>
            <div className="max-h-[50vh] overflow-y-auto pr-1">
              <ol className="space-y-2 text-sm">
                {questions.map((q, index) => (
                  <li
                    key={q.id}
                    className="rounded-md border bg-muted/20 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">
                        Question {index + 1}
                      </span>
                      <Badge
                        variant={
                          q.source === "practice" ? "secondary" : "outline"
                        }
                      >
                        {q.source === "practice" ? "Practice" : "AI"}
                      </Badge>
                    </div>
                    {q.title ? (
                      <Typography.Body className="mt-1 text-xs text-muted-foreground">
                        {q.title}
                      </Typography.Body>
                    ) : null}
                    <Typography.Body className="mt-1 whitespace-pre-wrap break-words">
                      {q.prompt}
                    </Typography.Body>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="test-interview-reviewed"
                checked={isReviewed}
                onCheckedChange={(value) => {
                  if (value === true) {
                    onReviewedChange(true);
                    return;
                  }

                  if (value === false) {
                    onReviewedChange(false);
                    return;
                  }

                  if (value === "indeterminate") {
                    return;
                  }

                  const _never: never = value;
                  throw new Error(`Unhandled checked change: ${_never}`);
                }}
              />
              <label
                htmlFor="test-interview-reviewed"
                className="text-sm leading-5"
              >
                I reviewed all questions. Start the interview.
              </label>
            </div>

            {linkPlan ? (
              <div className="pt-2">
                <CreatePublicInterviewLinkForm plan={linkPlan} />
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
