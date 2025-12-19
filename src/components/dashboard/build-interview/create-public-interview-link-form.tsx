"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  type CreatePublicInterviewLinkFormState,
  createPublicInterviewLinkAction,
} from "@/app/dashboard/public-interviews/actions";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreatePublicInterviewLinkFormProps {
  plan: unknown;
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
}: CreatePublicInterviewLinkFormProps) {
  const [state, formAction, isPending] = useActionState(
    createPublicInterviewLinkAction,
    initialState,
  );

  const titleError = firstError(state, "title");

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="plan" value={JSON.stringify(plan)} />
      <div className="space-y-2">
        <Label htmlFor="public-link-title">Public link title</Label>
        <Input
          id="public-link-title"
          name="title"
          aria-invalid={!!titleError}
          aria-describedby={titleError ? "public-link-title-error" : undefined}
          placeholder="e.g. Frontend Engineer Interview"
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

      <div className="flex items-center justify-end">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Creating..." : "Generate public link"}
        </Button>
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

      {state.status === "success" && state.publicUrl ? (
        <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Public URL</span>
            <Link
              href={state.publicUrl}
              className="font-medium underline underline-offset-4"
              target="_blank"
              rel="noreferrer"
            >
              Open
            </Link>
          </div>
          <Typography.SubCaption className="mt-1 block break-all text-muted-foreground">
            {state.publicUrl}
          </Typography.SubCaption>

          {state.linkId ? (
            <div className="mt-3 flex justify-end">
              <Button asChild variant="secondary" className="w-full sm:w-auto">
                <Link href={`/dashboard/public-interviews/${state.linkId}`}>
                  View details
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
