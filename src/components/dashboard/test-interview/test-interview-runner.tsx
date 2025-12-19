"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AiPositionSummary } from "@/app/dashboard/build-interview/actions";
import { generateTestInterviewAnswerFeedback } from "@/app/dashboard/build-interview/test-interview-actions";
import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getInterviewerById,
  getInterviewerForRole,
  type InterviewerProfile,
} from "@/lib/config/interviewers";
import type { PlannedQuestion } from "@/lib/test-interview/test-interview-types";
import { TestInterviewHeader } from "./test-interview-header";
import { TestInterviewInput } from "./test-interview-input";
import {
  type TestInterviewMessage,
  TestInterviewMessages,
} from "./test-interview-messages";

interface StoredTestInterviewPlan {
  summary: AiPositionSummary;
  questions: PlannedQuestion[];
  interviewerId?: string;
}

const STORAGE_KEY = "blairify-enterprise:test-interview-plan";

export function TestInterviewRunner() {
  const [plan, setPlan] = useState<StoredTestInterviewPlan | null>(null);
  const [messages, setMessages] = useState<TestInterviewMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answerHistory, setAnswerHistory] = useState<Record<string, string>>(
    {},
  );

  const interviewer: InterviewerProfile | null = useMemo(() => {
    if (!plan) {
      return null;
    }

    return (
      (plan.interviewerId
        ? getInterviewerById(plan.interviewerId)
        : undefined) ?? getInterviewerForRole(plan.summary.position)
    );
  }, [plan]);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredTestInterviewPlan;

      if (!parsed.questions || parsed.questions.length === 0) {
        return;
      }

      setPlan(parsed);
    } catch {
      setError("Unable to load test interview data.");
    }
  }, []);

  useEffect(() => {
    if (!plan || !interviewer) {
      return;
    }

    if (messages.length > 0) {
      return;
    }

    const intro: TestInterviewMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `${interviewer.name} here. Test interview starting now. Answer as you would in a real interview.`,
    };

    const firstQuestion = plan.questions[0];

    const first: TestInterviewMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: firstQuestion ? firstQuestion.prompt : "",
    };

    setMessages([intro, first]);
    setCurrentIndex(0);
  }, [plan, interviewer, messages.length]);

  const currentQuestion = useMemo(() => {
    if (!plan) return null;
    return plan.questions[currentIndex] ?? null;
  }, [plan, currentIndex]);

  async function handleSubmit() {
    if (!plan || !currentQuestion || !interviewer) {
      return;
    }

    if (isSending) {
      return;
    }

    const trimmed = input.trim();

    if (!trimmed) {
      return;
    }

    setError(null);
    setIsSending(true);

    const userMessage: TestInterviewMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    if (currentQuestion) {
      setAnswerHistory((prev) => ({ ...prev, [currentQuestion.id]: trimmed }));
    }

    try {
      const feedback = await generateTestInterviewAnswerFeedback({
        summary: plan.summary,
        interviewerId: interviewer.id,
        question: currentQuestion.prompt,
        answer: trimmed,
      });

      const assistantFeedback: TestInterviewMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: feedback,
      };

      const nextIndex = currentIndex + 1;
      const nextQuestion = plan.questions[nextIndex];

      if (!nextQuestion) {
        setMessages((prev) => [
          ...prev,
          assistantFeedback,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Interview complete. You can return to build another one.",
          },
        ]);
        setCurrentIndex(nextIndex);
        return;
      }

      setMessages((prev) => [
        ...prev,
        assistantFeedback,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: nextQuestion.prompt,
        },
      ]);
      setCurrentIndex(nextIndex);
    } catch {
      setError("Unable to get feedback right now. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  if (!plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? (
            <Typography.Body className="text-sm text-destructive">
              {error}
            </Typography.Body>
          ) : null}
          <Typography.Body className="text-sm text-muted-foreground">
            No interview plan loaded. Go back to build an interview first.
          </Typography.Body>
          <Button asChild>
            <Link href="/build-interview">Go to build interview</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!interviewer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Typography.Body className="text-sm text-muted-foreground">
            Loading interviewer…
          </Typography.Body>
        </CardContent>
      </Card>
    );
  }

  const totalQuestions = plan.questions.length;
  const currentQuestionNumber = Math.min(currentIndex + 1, totalQuestions);

  function handleRestore() {
    if (!currentQuestion) return;
    const previous = answerHistory[currentQuestion.id];
    if (previous) {
      setInput(previous);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isSending && input.trim()) {
        void handleSubmit();
      }
    }
  }

  return (
    <div className="space-y-8">
      <TestInterviewHeader
        interviewer={interviewer}
        summary={plan.summary}
        currentQuestion={currentQuestionNumber}
        totalQuestions={totalQuestions}
        isSending={isSending}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_360px]">
        <section className="space-y-6 rounded-3xl border border-border/70 bg-background/80 p-4 shadow-xl shadow-primary/5 backdrop-blur">
          <div className="max-h-[55vh] min-h-[45vh] overflow-y-auto pr-3">
            <TestInterviewMessages
              messages={messages}
              interviewer={interviewer}
              isSending={isSending}
            />
          </div>

          {error ? (
            <Typography.Body className="text-sm text-destructive">
              {error}
            </Typography.Body>
          ) : null}

          <TestInterviewInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            onRestore={handleRestore}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            error={error}
          />
        </section>

        <aside className="rounded-3xl border border-border/60 bg-background/80 p-4 shadow-xl shadow-primary/5 backdrop-blur">
          <Typography.SubCaption className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Question list
          </Typography.SubCaption>
          <Typography.Heading3 className="mt-1 text-lg font-semibold">
            Upcoming prompts
          </Typography.Heading3>
          <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-2 pr-2">
            {plan.questions.map((q, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border px-3 py-3 text-sm transition-all ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/60 bg-muted/20"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <Typography.SubCaption className="text-muted-foreground">
                      Q{idx + 1}
                    </Typography.SubCaption>
                    <Badge
                      variant={
                        q.source === "practice" ? "secondary" : "outline"
                      }
                      className="text-[10px]"
                    >
                      {q.source === "practice" ? "Practice" : "AI"}
                    </Badge>
                  </div>
                  <Typography.Body className="line-clamp-3 text-sm">
                    {q.prompt}
                  </Typography.Body>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
