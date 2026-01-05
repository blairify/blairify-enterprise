"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  type CreatePublicInterviewLinkFormState,
  createPublicInterviewLinkAction,
} from "@/app/dashboard/public-interviews/actions";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreatePublicInterviewLinkFormProps {
  plan: unknown;
  onLinkGenerated?: () => void;
  onStart?: () => void;
  canStart?: boolean;
  isReviewed?: boolean;
  onReviewedChange?: (value: boolean) => void;
}

const initialState: CreatePublicInterviewLinkFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

function firstError(
  state: CreatePublicInterviewLinkFormState,
  field: keyof CreatePublicInterviewLinkFormState["fieldErrors"],
) {
  const list = state.fieldErrors[field];
  if (!list || list.length === 0) return null;
  return list[0] ?? null;
}

export function CreatePublicInterviewLinkForm({
  plan,
  onLinkGenerated,
  onStart,
  canStart = false,
  isReviewed = false,
  onReviewedChange,
}: CreatePublicInterviewLinkFormProps) {
  const [state, formAction, isPending] = useActionState(
    createPublicInterviewLinkAction,
    initialState,
  );

  const titleError = firstError(state, "title");
  const isGenerated = state.status === "success" && !!state.publicUrl;
  const [titleValue, setTitleValue] = useState("");
  const isTitleEmpty = titleValue.trim() === "";

  useEffect(() => {
    if (isGenerated && onLinkGenerated) {
      onLinkGenerated();
    }
  }, [isGenerated, onLinkGenerated]);

  return (
    <form
      action={formAction}
      className="rounded-lg border border-border/50 bg-muted/10 p-4 space-y-4"
    >
      <input type="hidden" name="plan" value={JSON.stringify(plan)} />

      <div className="space-y-2">
        <Label htmlFor="public-link-title">Public link title</Label>
        <Input
          id="public-link-title"
          name="title"
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          aria-invalid={!!titleError}
          aria-describedby={titleError ? "public-link-title-error" : undefined}
          placeholder="e.g. Frontend Engineer Interview for Bayer"
        />
        {titleError ? (
          <Typography.SubCaption
            id="public-link-title-error"
            className="text-destructive"
          >
            {titleError}
          </Typography.SubCaption>
        ) : null}
      </div>

      {onReviewedChange ? (
        <div className="flex items-center gap-2 py-2">
          <Checkbox
            id="test-interview-reviewed"
            checked={isReviewed}
            onCheckedChange={(value) => {
              if (value === true) {
                onReviewedChange(true);
                return;
              }
              if (value === false) {
                onReviewedChange(false);
                return;
              }
            }}
          />
          <label
            htmlFor="test-interview-reviewed"
            className="text-sm font-medium leading-5 cursor-pointer"
          >
            I reviewed all questions
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={isPending || isTitleEmpty || !isReviewed}
        >
          {isPending ? "Creating..." : "Generate public link"}
        </Button>
        {onStart ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onStart}
            disabled={!canStart || !isGenerated}
          >
            Start test interview
          </Button>
        ) : null}
      </div>

      {state.status === "error" && state.message ? (
        <Typography.SubCaption className="text-destructive">
          {state.message}
        </Typography.SubCaption>
      ) : null}

      {isGenerated ? (
        <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <Typography.CaptionBold className="text-emerald-600 dark:text-emerald-400">
                Public link created
              </Typography.CaptionBold>
              <Typography.SubCaption className="mt-0.5 block truncate text-muted-foreground">
                {state.publicUrl}
              </Typography.SubCaption>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button asChild variant="ghost" size="sm">
                <Link
                  href={state.publicUrl ?? ""}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open link
                </Link>
              </Button>
              {state.linkId ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/public-interviews/${state.linkId}`}>
                    View details
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
