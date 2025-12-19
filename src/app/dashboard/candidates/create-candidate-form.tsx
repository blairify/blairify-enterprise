"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";

import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  type CreateCandidateFormState,
  createCandidateAction,
} from "./actions";

function fieldError(
  state: CreateCandidateFormState,
  field: keyof CreateCandidateFormState["fieldErrors"],
) {
  const errors = state.fieldErrors[field];

  if (!errors || errors.length === 0) {
    return null;
  }

  return errors[0];
}

const initialState: CreateCandidateFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

export function CreateCandidateForm() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (prevState: CreateCandidateFormState, formData: FormData) => {
      const result = await createCandidateAction(prevState, formData);

      if (result.status === "success") {
        router.refresh();
      }

      return result;
    },
    initialState,
  );

  const fullNameError = fieldError(state, "fullName");
  const emailError = fieldError(state, "email");
  const headlineError = fieldError(state, "headline");
  const locationError = fieldError(state, "location");
  const seniorityError = fieldError(state, "seniority");
  const currentCompanyError = fieldError(state, "currentCompany");
  const linkedInUrlError = fieldError(state, "linkedInUrl");
  const githubUrlError = fieldError(state, "githubUrl");
  const _cvUrlError = fieldError(state, "cvUrl");
  const notesError = fieldError(state, "notes");

  const isError = state.status === "error" && state.message;
  const isSuccess = state.status === "success" && state.message;

  return (
    <form
      action={formAction}
      className="space-y-6"
      aria-describedby={
        state.message ? "create-candidate-form-message" : undefined
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            aria-invalid={!!fullNameError}
            aria-describedby={
              fullNameError ? "create-candidate-full-name-error" : undefined
            }
          />
          {fullNameError ? (
            <Typography.Body
              id="create-candidate-full-name-error"
              className="text-sm text-destructive"
            >
              {fullNameError}
            </Typography.Body>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            name="email"
            type="email"
            aria-invalid={!!emailError}
            aria-describedby={
              emailError ? "create-candidate-email-error" : undefined
            }
          />
          {emailError ? (
            <Typography.Body
              id="create-candidate-email-error"
              className="text-sm text-destructive"
            >
              {emailError}
            </Typography.Body>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="headline">Headline (optional)</Label>
          <Input
            id="headline"
            name="headline"
            placeholder="e.g. Senior Backend Engineer"
            aria-invalid={!!headlineError}
            aria-describedby={
              headlineError ? "create-candidate-headline-error" : undefined
            }
          />
          {headlineError ? (
            <Typography.Body
              id="create-candidate-headline-error"
              className="text-sm text-destructive"
            >
              {headlineError}
            </Typography.Body>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location (optional)</Label>
          <Input
            id="location"
            name="location"
            aria-invalid={!!locationError}
            aria-describedby={
              locationError ? "create-candidate-location-error" : undefined
            }
            placeholder="City, Country"
          />
          {locationError ? (
            <Typography.Body
              id="create-candidate-location-error"
              className="text-sm text-destructive"
            >
              {locationError}
            </Typography.Body>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="seniority">Seniority (optional)</Label>
          <Input
            id="seniority"
            name="seniority"
            aria-invalid={!!seniorityError}
            aria-describedby={
              seniorityError ? "create-candidate-seniority-error" : undefined
            }
            placeholder="e.g. Senior, Lead"
          />
          {seniorityError ? (
            <Typography.Body
              id="create-candidate-seniority-error"
              className="text-sm text-destructive"
            >
              {seniorityError}
            </Typography.Body>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentCompany">Current company (optional)</Label>
          <Input
            id="currentCompany"
            name="currentCompany"
            aria-invalid={!!currentCompanyError}
            aria-describedby={
              currentCompanyError
                ? "create-candidate-current-company-error"
                : undefined
            }
          />
          {currentCompanyError ? (
            <Typography.Body
              id="create-candidate-current-company-error"
              className="text-sm text-destructive"
            >
              {currentCompanyError}
            </Typography.Body>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedInUrl">LinkedIn URL (optional)</Label>
          <Input
            id="linkedInUrl"
            name="linkedInUrl"
            aria-invalid={!!linkedInUrlError}
            aria-describedby={
              linkedInUrlError
                ? "create-candidate-linkedin-url-error"
                : undefined
            }
            placeholder="https://www.linkedin.com/in/..."
          />
          {linkedInUrlError ? (
            <Typography.Body
              id="create-candidate-linkedin-url-error"
              className="text-sm text-destructive"
            >
              {linkedInUrlError}
            </Typography.Body>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="githubUrl">GitHub URL (optional)</Label>
          <Input
            id="githubUrl"
            name="githubUrl"
            aria-invalid={!!githubUrlError}
            aria-describedby={
              githubUrlError ? "create-candidate-github-url-error" : undefined
            }
            placeholder="https://github.com/..."
          />
          {githubUrlError ? (
            <Typography.Body
              id="create-candidate-github-url-error"
              className="text-sm text-destructive"
            >
              {githubUrlError}
            </Typography.Body>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          aria-invalid={!!notesError}
          aria-describedby={
            notesError ? "create-candidate-notes-error" : undefined
          }
        />
        {notesError ? (
          <Typography.Body
            id="create-candidate-notes-error"
            className="text-sm text-destructive"
          >
            {notesError}
          </Typography.Body>
        ) : null}
      </div>

      {isError ? (
        <Typography.Body
          id="create-candidate-form-message"
          className="text-sm text-destructive"
          aria-live="polite"
        >
          {state.message}
        </Typography.Body>
      ) : null}

      {isSuccess ? (
        <Typography.Body
          id="create-candidate-form-message"
          className="text-sm text-emerald-600 dark:text-emerald-400"
          aria-live="polite"
        >
          {state.message}
        </Typography.Body>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Adding candidate..." : "Add candidate"}
      </Button>
    </form>
  );
}
