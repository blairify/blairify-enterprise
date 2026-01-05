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
      className="rounded-lg border border-border/50 bg-muted/10 p-4"
    >
      <input type="hidden" name="plan" value={JSON.stringify(plan)} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-4">
          <Label htmlFor="public-link-title">Public link title</Label>
          <Input
            id="public-link-title"
            name="title"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            aria-invalid={!!titleError}
            aria-describedby={
              titleError ? "public-link-title-error" : undefined
            }
            placeholder="e.g. Frontend Engineer Interview for Bayer"
          />
          {titleError ? (
            <Typography.Body
              id="public-link-title-error"
              className="text-sm text-destructive"
            >
              {titleError}
            </Typography.Body>
          ) : null}
        </div>
        {onReviewedChange ? (
          <div className="flex items-center gap-2">
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
              className="text-sm font-medium leading-5"
            >
              I reviewed all questions
            </label>
          </div>
        ) : null}
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
            onClick={onStart}
            disabled={!canStart || !isGenerated}
          >
            Start test interview
          </Button>
        ) : null}
      </div>

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
      {isGenerated ? (
        <div className="mt-3 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <Typography.Body className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Public link generated
              </Typography.Body>
              <Typography.SubCaption className="mt-1 block break-all text-muted-foreground">
                {state.publicUrl}
              </Typography.SubCaption>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={state.publicUrl ?? ""}
                className="text-sm font-medium text-emerald-600 underline underline-offset-4 dark:text-emerald-400"
                target="_blank"
                rel="noreferrer"
              >
                Open
              </Link>
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
