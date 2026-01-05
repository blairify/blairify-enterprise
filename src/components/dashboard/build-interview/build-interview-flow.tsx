"use client";

import { useRef, useState } from "react";

import type { AiPositionSummary } from "@/app/dashboard/build-interview/actions";
import { generateTestInterviewQuestionPlan } from "@/app/dashboard/build-interview/test-interview-actions";
import { getInterviewerForRole } from "@/lib/config/interviewers";
import type { PlannedQuestion } from "@/lib/test-interview/test-interview-types";
import {
  BuildInterviewAiChat,
  type QuickPickField,
  type QuickPickSelections,
} from "./build-interview-ai-chat";
import { QuestionsList } from "./questions-list";
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
  const [quickPickSelections, setQuickPickSelections] =
    useState<QuickPickSelections>({
      position: null,
      seniority: null,
      duration: null,
    });
  const [isSending, setIsSending] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const sendMessageRef = useRef<((content: string) => Promise<void>) | null>(
    null,
  );

  async function handleQuickPickSelect(
    field: QuickPickField,
    value: string,
    label: string,
  ) {
    if (isSending || isSummarizing) return;

    setQuickPickSelections((prev) => ({
      ...prev,
      [field]: value,
    }));

    let content = "";
    switch (field) {
      case "position": {
        content = `Let's target the ${label} position.`;
        break;
      }
      case "seniority": {
        content = `The seniority level should be ${label}.`;
        break;
      }
      case "duration": {
        content = `Make the interview last ${label}.`;
        break;
      }
      default: {
        const _never: never = field;
        throw new Error(`Unhandled field: ${_never}`);
      }
    }

    if (content && sendMessageRef.current) {
      await sendMessageRef.current(content);
    }
  }

  const gridClassName = summary
    ? "grid gap-6 lg:grid-cols-[1fr_420px] h-[calc(100vh-12rem)]"
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
    <div className="w-full max-w-6xl mx-auto">
      <div className={gridClassName}>
        <BuildInterviewAiChat
          onSummary={(value) => setSummary(value)}
          quickPickSelections={quickPickSelections}
          onQuickPickSelectionsChange={setQuickPickSelections}
          isSending={isSending}
          onIsSendingChange={setIsSending}
          isSummarizing={isSummarizing}
          onIsSummarizingChange={setIsSummarizing}
          onSendMessageRef={sendMessageRef}
        />
        {summary ? (
          <TestInterviewPlanPanel
            summary={summary}
            isGenerating={isGenerating}
            error={error}
            canStart={Boolean(questions && questions.length > 0 && isReviewed)}
            onGenerate={handleGenerate}
            quickPickSelections={quickPickSelections}
            onQuickPickSelect={handleQuickPickSelect}
            isSending={isSending}
            isSummarizing={isSummarizing}
          />
        ) : null}
      </div>

      {summary && questions && questions.length > 0 ? (
        <div className="mt-6">
          <QuestionsList
            summary={summary}
            questions={questions}
            isReviewed={isReviewed}
            onReviewedChange={setIsReviewed}
            onStart={handleStart}
          />
        </div>
      ) : null}
    </div>
  );
}
