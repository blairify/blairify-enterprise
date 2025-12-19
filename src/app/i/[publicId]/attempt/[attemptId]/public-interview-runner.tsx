"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";

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

export function PublicInterviewRunner({
  publicId,
  attemptId,
  linkTitle,
  plan,
  isCompleted,
}: PublicInterviewRunnerProps) {
  const questions = useMemo(() => readQuestions(plan), [plan]);

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
      <div className="space-y-2">
        <Typography.Heading3 className="text-2xl font-semibold">
          {linkTitle}
        </Typography.Heading3>
        <Typography.Body className="text-sm text-muted-foreground">
          Thank you. Your interview is complete.
        </Typography.Body>
      </div>
    );
  }

  const showSubmit = status === "awaiting_scoring";

  return (
    <div className="space-y-8">
      <PublicInterviewHeader
        linkTitle={linkTitle}
        currentQuestion={Math.min(currentQuestionIndex + 1, totalQuestions)}
        totalQuestions={totalQuestions}
        isSaving={isPending}
      />

      <section className="space-y-6 rounded-3xl border border-border/70 bg-background/80 p-4 shadow-xl shadow-primary/5 backdrop-blur">
        <div className="max-h-[55vh] min-h-[45vh] overflow-y-auto pr-3">
          <PublicInterviewMessages
            linkTitle={linkTitle}
            messages={messages}
            isSaving={isPending}
          />
        </div>

        {error ? (
          <Typography.Body className="text-sm text-destructive">
            {error}
          </Typography.Body>
        ) : null}

        {showSubmit ? (
          <div className="flex flex-col gap-3">
            <Typography.Body className="text-sm text-muted-foreground">
              You’ve answered all questions. Submit to finish.
            </Typography.Body>
            <div className="flex justify-end">
              <Button
                type="button"
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
      </section>
    </div>
  );
}
