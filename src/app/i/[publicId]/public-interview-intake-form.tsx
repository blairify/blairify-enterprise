"use client";

import { useActionState, useEffect } from "react";
import {
  type PublicInterviewIntakeFormState,
  submitPublicInterviewIntakeAction,
} from "@/app/i/actions";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PublicInterviewIntakeFormProps {
  publicId: string;
}

const initialState: PublicInterviewIntakeFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

function firstError(
  state: PublicInterviewIntakeFormState,
  field: keyof PublicInterviewIntakeFormState["fieldErrors"],
) {
  const errors = state.fieldErrors[field];
  if (!errors || errors.length === 0) return null;
  return errors[0] ?? null;
}

export function PublicInterviewIntakeForm({
  publicId,
}: PublicInterviewIntakeFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitPublicInterviewIntakeAction.bind(null, publicId),
    initialState,
  );

  useEffect(() => {
    if (state.status !== "success" || !state.attemptUrl) return;
    window.location.href = state.attemptUrl;
  }, [state]);

  const firstNameError = firstError(state, "firstName");
  const lastNameError = firstError(state, "lastName");
  const emailError = firstError(state, "email");
  const phoneError = firstError(state, "phone");
  const locationError = firstError(state, "location");
  const cvError = firstError(state, "cvFile");

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            name="firstName"
            aria-invalid={!!firstNameError}
            aria-describedby={
              firstNameError ? "public-intake-first-name-error" : undefined
            }
          />
          {firstNameError ? (
            <Typography.Body
              id="public-intake-first-name-error"
              className="text-sm text-destructive"
            >
              {firstNameError}
            </Typography.Body>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            name="lastName"
            aria-invalid={!!lastNameError}
            aria-describedby={
              lastNameError ? "public-intake-last-name-error" : undefined
            }
          />
          {lastNameError ? (
            <Typography.Body
              id="public-intake-last-name-error"
              className="text-sm text-destructive"
            >
              {lastNameError}
            </Typography.Body>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          aria-invalid={!!emailError}
          aria-describedby={
            emailError ? "public-intake-email-error" : undefined
          }
        />
        {emailError ? (
          <Typography.Body
            id="public-intake-email-error"
            className="text-sm text-destructive"
          >
            {emailError}
          </Typography.Body>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            aria-invalid={!!phoneError}
            aria-describedby={
              phoneError ? "public-intake-phone-error" : undefined
            }
          />
          {phoneError ? (
            <Typography.Body
              id="public-intake-phone-error"
              className="text-sm text-destructive"
            >
              {phoneError}
            </Typography.Body>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Place of living</Label>
          <Input
            id="location"
            name="location"
            aria-invalid={!!locationError}
            aria-describedby={
              locationError ? "public-intake-location-error" : undefined
            }
            placeholder="City, Country"
          />
          {locationError ? (
            <Typography.Body
              id="public-intake-location-error"
              className="text-sm text-destructive"
            >
              {locationError}
            </Typography.Body>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cvFile">CV (PDF, optional)</Label>
        <Input
          id="cvFile"
          name="cvFile"
          type="file"
          accept="application/pdf"
          aria-invalid={!!cvError}
          aria-describedby={cvError ? "public-intake-cv-error" : undefined}
        />
        {cvError ? (
          <Typography.Body
            id="public-intake-cv-error"
            className="text-sm text-destructive"
          >
            {cvError}
          </Typography.Body>
        ) : null}
      </div>

      {state.status === "error" && state.message ? (
        <Typography.Body className="text-sm text-destructive">
          {state.message}
        </Typography.Body>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:justify-end">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Starting..." : "Start interview"}
        </Button>
      </div>
    </form>
  );
}
