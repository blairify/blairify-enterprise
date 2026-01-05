"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import Logo from "@/components/common/atoms/logo-blairify";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import {
  type PublicInterviewClientState,
  sendPublicInterviewMessageAction,
  startPublicInterviewAttemptAction,
  submitPublicInterviewAttemptForScoringAction,
} from "./actions";
import { PublicInterviewHeader } from "./public-interview-header";
import { PublicInterviewInput } from "./public-interview-input";
import { PublicInterviewMessages } from "./public-interview-messages";

type PlannedQuestion = {
  id: string;
  prompt: string;
  title?: string;
};

interface PublicInterviewRunnerProps {
  publicId: string;
  attemptId: string;
  linkTitle: string;
  plan: unknown;
  isCompleted: boolean;
}

function readQuestions(plan: unknown): PlannedQuestion[] {
  if (!plan || typeof plan !== "object") return [];

  const maybe = (plan as { questions?: unknown }).questions;
  if (!Array.isArray(maybe)) return [];

  const out: PlannedQuestion[] = [];

  for (const item of maybe) {
    if (!item || typeof item !== "object") continue;

    const id = (item as { id?: unknown }).id;
    const prompt = (item as { prompt?: unknown }).prompt;
    const title = (item as { title?: unknown }).title;

    if (typeof id !== "string" || typeof prompt !== "string") continue;

    out.push({
      id,
      prompt,
      title: typeof title === "string" ? title : undefined,
    });
  }

  return out;
}

function readCompanyName(plan: unknown): string | undefined {
  if (!plan || typeof plan !== "object") return undefined;
  const summary = (plan as { summary?: unknown }).summary;
  if (!summary || typeof summary !== "object") return undefined;
  const companyProfile = (summary as { companyProfile?: unknown })
    .companyProfile;
  if (
    typeof companyProfile === "string" &&
    companyProfile.trim() &&
    companyProfile !== "unknown"
  ) {
    return companyProfile.trim();
  }
  return undefined;
}

export function PublicInterviewRunner({
  publicId,
  attemptId,
  linkTitle,
  plan,
  isCompleted,
}: PublicInterviewRunnerProps) {
  const questions = useMemo(() => readQuestions(plan), [plan]);
  const companyName = useMemo(() => readCompanyName(plan), [plan]);

  const [state, setState] = useState<PublicInterviewClientState | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isCompleted) {
      setState({
        messages: [],
        currentQuestionIndex: questions.length,
        totalQuestions: questions.length,
        status: "completed",
      });
      return;
    }

    startTransition(async () => {
      try {
        const next = await startPublicInterviewAttemptAction({
          publicId,
          attemptId,
        });
        setState(next);
      } catch {
        setError("Failed to start interview. Please refresh and try again.");
      }
    });
  }, [attemptId, isCompleted, publicId, questions.length]);

  const status = state?.status ?? "in_progress";
  const messages = state?.messages ?? [];
  const currentQuestionIndex = state?.currentQuestionIndex ?? 0;
  const totalQuestions = state?.totalQuestions ?? questions.length;
  const interviewerId = state?.interviewerId;

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Answer is required.");
      return;
    }

    setError(null);
    setInput("");

    startTransition(async () => {
      try {
        const next = await sendPublicInterviewMessageAction({
          publicId,
          attemptId,
          message: trimmed,
        });
        setState(next);
      } catch {
        setError("Failed to send message. Please try again.");
        setInput(trimmed);
      }
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isPending && input.trim()) {
        void handleSend();
      }
    }
  }

  async function handleSubmitForScoring() {
    startTransition(async () => {
      try {
        const next = await submitPublicInterviewAttemptForScoringAction({
          publicId,
          attemptId,
        });
        setState(next);
      } catch {
        setError("Failed to submit interview. Please try again.");
      }
    });
  }

  if (!state && !error) {
    return (
      <div className="space-y-2">
        <Typography.Body className="text-sm text-muted-foreground">
          Loading interview…
        </Typography.Body>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-2">
        <Typography.Body className="text-sm">
          No questions found.
        </Typography.Body>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <Logo variant="iconOnly" iconSize={72} textClassName="text-3xl" />
        <Typography.Heading2 className="mb-2 mt-10 text-center text-2xl font-semibold">
          Interview Complete
        </Typography.Heading2>

        <Typography.Caption className="max-w-md text-center text-muted-foreground">
          Thank you for completing your interview. Your responses have been
          submitted and recruiters will be in touch.
        </Typography.Caption>
        <div className="mt-8 rounded-lg border border-border/50 bg-muted/30 px-6 py-2 text-center">
          <Typography.SubCaption className="text-muted-foreground">
            You can safely close this page now.
          </Typography.SubCaption>
        </div>
        <div className="mt-8"></div>
      </div>
    );
  }

  const showSubmit = status === "awaiting_scoring";

  return (
    <div className="space-y-8">
      <PublicInterviewHeader
        linkTitle={linkTitle}
        companyName={companyName}
        currentQuestion={Math.min(currentQuestionIndex + 1, totalQuestions)}
        totalQuestions={totalQuestions}
        isSaving={isPending}
      />

      <div className="flex flex-col rounded-2xl border border-border/50 bg-background/95 shadow-2xl shadow-primary/5 backdrop-blur overflow-hidden">
        <div className="flex-1 max-h-[60vh] min-h-[40vh] overflow-y-auto">
          <PublicInterviewMessages
            messages={messages}
            isSaving={isPending}
            interviewerId={interviewerId}
          />
        </div>

        {error ? (
          <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
            <Typography.SubCaption className="text-destructive">
              {error}
            </Typography.SubCaption>
          </div>
        ) : null}

        {showSubmit ? (
          <div className="border-t border-border/50 bg-gradient-to-t from-background to-background/80 p-6">
            <div className="mx-auto max-w-2xl text-center space-y-4">
              <Typography.Body className="text-muted-foreground">
                You've answered all questions. Ready to submit?
              </Typography.Body>
              <Button
                type="button"
                size="lg"
                onClick={() => void handleSubmitForScoring()}
                disabled={isPending}
              >
                Submit interview
              </Button>
            </div>
          </div>
        ) : (
          <PublicInterviewInput
            value={input}
            onChange={setInput}
            onSubmit={handleSend}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            isSaving={isPending}
            hasStoredAnswer={false}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
