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
    <div className="border-t border-border/50 bg-gradient-to-t from-background to-background/80 px-4 py-4">
      <div className="mx-auto max-w-2xl">
        <div className="relative rounded-2xl border border-border/70 bg-background shadow-lg shadow-primary/5 transition-shadow focus-within:border-primary/50 focus-within:shadow-primary/10">
          <Textarea
            value={value}
            onChange={(event) => {
              const next = event.target.value;
              if (next.length <= MAX_CHARS) {
                onChange(next);
              }
            }}
            onKeyDown={onKeyDown}
            placeholder="Type your answer here..."
            disabled={disabled || isSaving}
            className="min-h-[120px] max-h-[300px] resize-none border-0 bg-transparent px-4 py-4 pr-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? "public-interview-answer-error" : undefined
            }
          />

          <div className="absolute bottom-3 right-3">
            <Button
              type="button"
              className="h-10 w-10 rounded-xl shadow-md transition-transform hover:scale-105"
              size="icon"
              disabled={disabled || isSaving || !value.trim()}
              onClick={onSubmit}
              aria-label="Submit answer"
            >
              <ArrowUp className="size-5" />
            </Button>
          </div>
        </div>

        {error ? (
          <Typography.SubCaption
            id="public-interview-answer-error"
            className="mt-2 block text-destructive"
          >
            {error}
          </Typography.SubCaption>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {hasStoredAnswer ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                disabled={disabled || isSaving}
                onClick={onRestore}
              >
                <RotateCcw className="size-3.5" />
                Restore
              </Button>
            ) : null}
            <Typography.SubCaption className="text-muted-foreground">
              ↵ Enter to send · ⇧↵ for new line
            </Typography.SubCaption>
          </div>
          <Typography.SubCaption
            className={nearLimit ? "text-destructive" : "text-muted-foreground"}
          >
            {remaining.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </Typography.SubCaption>
        </div>
      </div>
    </div>
  );
}
