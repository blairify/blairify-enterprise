"use client";

import { useState } from "react";
import type { AiPositionSummary } from "@/app/dashboard/build-interview/actions";
import { Typography } from "@/components/common/atoms/typography";
import type { PlannedQuestion } from "@/lib/test-interview/test-interview-types";
import { CreatePublicInterviewLinkForm } from "./create-public-interview-link-form";

interface QuestionsListProps {
  summary: AiPositionSummary;
  questions: PlannedQuestion[];
  isReviewed: boolean;
  onReviewedChange: (next: boolean) => void;
  onStart: () => void;
}

export function QuestionsList({
  summary,
  questions,
  isReviewed,
  onReviewedChange,
  onStart,
}: QuestionsListProps) {
  const linkPlan = { summary, questions };
  const [isLinkGenerated, setIsLinkGenerated] = useState(false);
  const canStart = isReviewed && isLinkGenerated;

  const sortedQuestions = [...questions].sort((a, b) => {
    if (a.source === "practice" && b.source !== "practice") return -1;
    if (a.source !== "practice" && b.source === "practice") return 1;
    return 0;
  });

  return (
    <div className="space-y-3 pb-8">
      <div className="text-center">
        <Typography.Body className="text-lg font-semibold">
          Questions that will be asked
        </Typography.Body>
        <Typography.Caption className="text-muted-foreground">
          {questions.length} questions
        </Typography.Caption>
      </div>
      <div className="overflow-x-auto">
        <ol className="grid gap-2 text-sm md:grid-cols-2 lg:grid-cols-3">
          {sortedQuestions.map((q, index) => (
            <li
              key={q.id}
              className="rounded-md border bg-muted/20 px-3 py-4 min-w-0"
            >
              <div className="flex mb-4 items-center justify-between gap-2 flex-wrap">
                <Typography.SubCaption className="text-muted-foreground">
                  Question {index + 1}
                </Typography.SubCaption>
                {q.source === "practice" ? (
                  <Typography.SubCaptionMedium className="inline-block rounded-md border border-[hsl(var(--accent-main-100))] bg-[hsl(var(--accent-main-100)/0.2)] px-2 py-0.5 text-[hsl(var(--accent-main-100))]">
                    Our templates recommend
                  </Typography.SubCaptionMedium>
                ) : (
                  <Typography.SubCaptionMedium className="relative inline-block rounded-md border border-[hsl(var(--accent-main-100))] bg-[hsl(var(--accent-main-100)/0.2)] px-2 py-0.5 text-[hsl(var(--accent-main-100))]">
                    <Typography.SubCaption className="absolute inset-0 animate-pulse rounded-md shadow-[0_0_12px_hsl(var(--accent-main-100)/0.6)]" />
                    <Typography.SubCaption className="relative">
                      Blairify AI generated
                    </Typography.SubCaption>
                  </Typography.SubCaptionMedium>
                )}
              </div>
              {q.title ? (
                <Typography.BodyBold className="mb-2 mt-2 text-muted-foreground break-words">
                  {q.title}
                </Typography.BodyBold>
              ) : null}
              <Typography.SubCaption className="whitespace-pre-wrap break-words mt-2 overflow-hidden">
                {q.description ?? q.prompt}
              </Typography.SubCaption>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4">
        <CreatePublicInterviewLinkForm
          plan={linkPlan}
          onLinkGenerated={() => setIsLinkGenerated(true)}
          onStart={onStart}
          canStart={canStart}
          isReviewed={isReviewed}
          onReviewedChange={onReviewedChange}
        />
      </div>
    </div>
  );
}
