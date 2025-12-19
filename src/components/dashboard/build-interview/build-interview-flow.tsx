"use client";

import { useState } from "react";

import type { AiPositionSummary } from "@/app/dashboard/build-interview/actions";
import { generateTestInterviewQuestionPlan } from "@/app/dashboard/build-interview/test-interview-actions";
import { getInterviewerForRole } from "@/lib/config/interviewers";
import type { PlannedQuestion } from "@/lib/test-interview/test-interview-types";
import { BuildInterviewAiChat } from "./build-interview-ai-chat";
import { TestInterviewPlanPanel } from "./test-interview-plan-panel";

export type InterviewPersonalization = "personalized" | "general";
export type InterviewSource = "scratch" | "job_listing" | "ai";
export type BuildInterviewStep = "type" | "source";

const STORAGE_KEY = "blairify-enterprise:test-interview-plan";

export function BuildInterviewFlow() {
  const [summary, setSummary] = useState<AiPositionSummary | null>(null);
  const [questions, setQuestions] = useState<PlannedQuestion[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gridClassName = summary
    ? "grid gap-6 lg:grid-cols-[1fr_420px]"
    : "grid gap-6";

  async function handleGenerate() {
    if (!summary) {
      return;
    }

    setError(null);
    setIsGenerating(true);
    setIsReviewed(false);

    try {
      const plan = await generateTestInterviewQuestionPlan(summary);
      setQuestions(plan);
    } catch {
      setQuestions(null);
      setError("Unable to generate questions. Check config and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleStart() {
    if (!summary || !questions || questions.length === 0 || !isReviewed) {
      return;
    }

    const interviewer = getInterviewerForRole(summary.position);

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ summary, questions, interviewerId: interviewer.id }),
    );

    window.location.href = "/test-interview";
  }

  return (
    <div className="bg-background flex items-stretch justify-center">
      <div className="w-full max-w-6xl">
        <div className={gridClassName}>
          <BuildInterviewAiChat onSummary={(value) => setSummary(value)} />
          {summary ? (
            <TestInterviewPlanPanel
              summary={summary}
              questions={questions}
              isGenerating={isGenerating}
              error={error}
              isReviewed={isReviewed}
              onReviewedChange={setIsReviewed}
              onGenerate={handleGenerate}
              onStart={handleStart}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
