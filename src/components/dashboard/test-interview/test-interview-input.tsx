import { ArrowUp, RotateCcw } from "lucide-react";
import type { KeyboardEvent } from "react";

import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TestInterviewInputProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  onRestore?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  error?: string | null;
  inputId?: string;
}

const MAX_CHARS = 2000;

export function TestInterviewInput({
  value,
  onChange,
  onSubmit,
  onRestore,
  onKeyDown,
  disabled = false,
  error,
  inputId = "test-interview-input",
}: TestInterviewInputProps) {
  const charCount = value.length;
  const remaining = Math.max(0, MAX_CHARS - charCount);
  const nearLimit = charCount > MAX_CHARS * 0.8;

  return (
    <div className="space-y-4 rounded-3xl border border-border/60 bg-background/90 p-4 shadow-lg shadow-primary/5 backdrop-blur">
      <div className="flex items-center justify-between">
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
        <label className="sr-only" htmlFor={inputId}>
          Your answer
        </label>
        <Textarea
          id={inputId}
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            if (next.length <= MAX_CHARS) {
              onChange(next);
            }
          }}
          onKeyDown={onKeyDown}
          placeholder="Type your answer…"
          disabled={disabled}
          className="min-h-[140px] resize-none border-border/70 bg-background/90 text-base"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-label="Your answer"
        />
        <Button
          type="button"
          className="absolute bottom-3 right-3 rounded-full"
          size="icon"
          disabled={disabled || !value.trim()}
          onClick={onSubmit}
          aria-label="Send"
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>

      {error ? (
        <Typography.Body
          id={`${inputId}-error`}
          className="text-sm text-destructive"
        >
          {error}
        </Typography.Body>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2"
          disabled={!onRestore || disabled}
          onClick={onRestore}
        >
          <RotateCcw className="size-4" />
          Restore previous answer
        </Button>
        <span>Press Enter to submit, Shift + Enter for newline.</span>
      </div>
    </div>
  );
}
