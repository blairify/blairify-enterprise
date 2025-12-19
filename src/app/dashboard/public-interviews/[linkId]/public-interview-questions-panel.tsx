"use client";

import { ArrowDown, ArrowUp, Minus, Plus, Save } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type UpdatePublicInterviewQuestionsFormState,
  updatePublicInterviewQuestionsAction,
} from "./actions";

type Question = {
  id: string;
  prompt: string;
  title?: string;
};

interface PublicInterviewQuestionsPanelProps {
  linkId: string;
  initialQuestions: Question[];
}

const initialState: UpdatePublicInterviewQuestionsFormState = {
  status: "idle",
  message: null,
};

function normalizeQuestions(list: Question[]) {
  return list.map((q) => ({
    id: q.id,
    title: (q.title ?? "").trim() || undefined,
    prompt: q.prompt.trim(),
  }));
}

function stableId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function PublicInterviewQuestionsPanel({
  linkId,
  initialQuestions,
}: PublicInterviewQuestionsPanelProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [state, formAction, isPending] = useActionState(
    updatePublicInterviewQuestionsAction,
    initialState,
  );

  const questionsJson = useMemo(() => JSON.stringify(questions), [questions]);

  const dirty = useMemo(() => {
    return (
      JSON.stringify(normalizeQuestions(questions)) !==
      JSON.stringify(normalizeQuestions(initialQuestions))
    );
  }, [initialQuestions, questions]);

  const hasInvalid = useMemo(() => {
    return questions.some((q) => q.prompt.trim().length === 0);
  }, [questions]);

  const canSave = dirty && !hasInvalid && !isPending;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="linkId" value={linkId} />
      <input type="hidden" name="questions" value={questionsJson} />

      <div className="flex items-center justify-between gap-3">
        <div>
          <Typography.SubCaption className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Questions
          </Typography.SubCaption>
          <div className="mt-1 flex items-center gap-2">
            <Typography.Heading3 className="text-lg font-semibold">
              Assigned question bank
            </Typography.Heading3>
            {dirty ? <Badge variant="outline">Unsaved</Badge> : null}
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="gap-2"
          onClick={() => {
            setQuestions((prev) => [
              ...prev,
              { id: stableId(), title: "", prompt: "" },
            ]);
          }}
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {questions.length === 0 ? (
        <Typography.Body className="text-sm text-muted-foreground">
          No questions yet.
        </Typography.Body>
      ) : (
        <div className="max-h-[62vh] overflow-y-auto space-y-3 pr-1">
          {questions.map((q, idx) => {
            const invalid = q.prompt.trim().length === 0;

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-border/60 bg-muted/10 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <Typography.SubCaption className="text-xs text-muted-foreground">
                    Q{idx + 1}
                  </Typography.SubCaption>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={isPending || idx === 0}
                      aria-label={`Move question ${idx + 1} up`}
                      onClick={() => {
                        setQuestions((prev) => {
                          const next = [...prev];
                          const swap = next[idx - 1];
                          next[idx - 1] = next[idx];
                          next[idx] = swap;
                          return next;
                        });
                      }}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={isPending || idx + 1 >= questions.length}
                      aria-label={`Move question ${idx + 1} down`}
                      onClick={() => {
                        setQuestions((prev) => {
                          const next = [...prev];
                          const swap = next[idx + 1];
                          next[idx + 1] = next[idx];
                          next[idx] = swap;
                          return next;
                        });
                      }}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={isPending}
                      aria-label={`Remove question ${idx + 1}`}
                      onClick={() => {
                        setQuestions((prev) =>
                          prev.filter((x) => x.id !== q.id),
                        );
                      }}
                    >
                      <Minus className="size-4" />
                    </Button>
                  </div>
                </div>

                <Input
                  value={q.title ?? ""}
                  onChange={(e) => {
                    const title = e.target.value;
                    setQuestions((prev) =>
                      prev.map((item) =>
                        item.id === q.id ? { ...item, title } : item,
                      ),
                    );
                  }}
                  placeholder="Optional title"
                  disabled={isPending}
                />

                <Textarea
                  value={q.prompt}
                  onChange={(e) => {
                    const prompt = e.target.value;
                    setQuestions((prev) =>
                      prev.map((item) =>
                        item.id === q.id ? { ...item, prompt } : item,
                      ),
                    );
                  }}
                  placeholder="Question prompt"
                  disabled={isPending}
                  className="min-h-[110px]"
                  aria-invalid={invalid}
                />

                {invalid ? (
                  <Typography.Body className="text-sm text-destructive">
                    Prompt is required.
                  </Typography.Body>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {state.message ? (
        <Typography.Body
          className={
            state.status === "success"
              ? "text-sm text-foreground"
              : "text-sm text-destructive"
          }
        >
          {state.message}
        </Typography.Body>
      ) : null}

      <div className="sticky bottom-0 bg-background/80 backdrop-blur rounded-2xl border border-border/60 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Typography.SubCaption className="text-xs text-muted-foreground">
            {hasInvalid
              ? "Fix empty prompts before saving."
              : dirty
                ? "Unsaved changes."
                : "All changes saved."}
          </Typography.SubCaption>
          <Button type="submit" disabled={!canSave} className="gap-2">
            <Save className="size-4" />
            {isPending ? "Saving..." : "Save questions"}
          </Button>
        </div>
      </div>
    </form>
  );
}
