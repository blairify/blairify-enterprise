import { ArrowUp, RotateCcw } from "lucide-react";

import type { KeyboardEvent } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PublicInterviewInputProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  onRestore?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  isSaving?: boolean;
  hasStoredAnswer?: boolean;
  error?: string | null;
}

const MAX_CHARS = 2000;

export function PublicInterviewInput({
  value,
  onChange,
  onSubmit,
  onRestore,
  onKeyDown,
  disabled = false,
  isSaving = false,
  hasStoredAnswer = false,
  error,
}: PublicInterviewInputProps) {
  const charCount = value.length;
  const remaining = Math.max(0, MAX_CHARS - charCount);
  const nearLimit = charCount > MAX_CHARS * 0.8;

  return (
    <section className="space-y-4 rounded-3xl border border-border/60 bg-background/80 p-4 shadow-lg shadow-primary/5 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <Typography.SubCaption className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Your response
        </Typography.SubCaption>
        <Typography.SubCaption
          className={`text-xs ${nearLimit ? "text-destructive" : "text-muted-foreground"}`}
        >
          {remaining} characters left
        </Typography.SubCaption>
      </div>

      <div className="relative">
        <Textarea
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            if (next.length <= MAX_CHARS) {
              onChange(next);
            }
          }}
          onKeyDown={onKeyDown}
          placeholder="Type your answer…"
          disabled={disabled || isSaving}
          className="min-h-[140px] resize-none border-border/70 bg-background/90 text-base"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "public-interview-answer-error" : undefined}
        />

        <Button
          type="button"
          className="absolute bottom-3 right-3 rounded-full"
          size="icon"
          disabled={disabled || isSaving || !value.trim()}
          onClick={onSubmit}
          aria-label="Submit answer"
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>

      {error ? (
        <Typography.Body
          id="public-interview-answer-error"
          className="text-sm text-destructive"
        >
          {error}
        </Typography.Body>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2"
          disabled={!hasStoredAnswer || disabled || isSaving}
          onClick={onRestore}
        >
          <RotateCcw className="size-4" />
          Restore answer
        </Button>
        <div className="text-xs text-muted-foreground">
          Press Enter to submit. Shift + Enter for a new line.
        </div>
      </div>
    </section>
  );
}
