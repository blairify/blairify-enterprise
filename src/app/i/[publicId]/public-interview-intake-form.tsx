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
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">
            First name
          </Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="John"
            aria-invalid={!!firstNameError}
            aria-describedby={
              firstNameError ? "public-intake-first-name-error" : undefined
            }
          />
          {firstNameError ? (
            <Typography.SubCaption
              id="public-intake-first-name-error"
              className="text-destructive"
            >
              {firstNameError}
            </Typography.SubCaption>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last name
          </Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Doe"
            aria-invalid={!!lastNameError}
            aria-describedby={
              lastNameError ? "public-intake-last-name-error" : undefined
            }
          />
          {lastNameError ? (
            <Typography.SubCaption
              id="public-intake-last-name-error"
              className="text-destructive"
            >
              {lastNameError}
            </Typography.SubCaption>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john.doe@example.com"
          aria-invalid={!!emailError}
          aria-describedby={
            emailError ? "public-intake-email-error" : undefined
          }
        />
        {emailError ? (
          <Typography.SubCaption
            id="public-intake-email-error"
            className="text-destructive"
          >
            {emailError}
          </Typography.SubCaption>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone
          </Label>
          <Input
            id="phone"
            name="phone"
            placeholder="+1 234 567 890"
            aria-invalid={!!phoneError}
            aria-describedby={
              phoneError ? "public-intake-phone-error" : undefined
            }
          />
          {phoneError ? (
            <Typography.SubCaption
              id="public-intake-phone-error"
              className="text-destructive"
            >
              {phoneError}
            </Typography.SubCaption>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            Location
          </Label>
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
            <Typography.SubCaption
              id="public-intake-location-error"
              className="text-destructive"
            >
              {locationError}
            </Typography.SubCaption>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 opacity-50">
        <Label htmlFor="cvFile" className="text-sm font-medium">
          CV{" "}
          <Typography.SubCaption className="text-muted-foreground">
            (PDF, optional)
          </Typography.SubCaption>
        </Label>
        <Input
          id="cvFile"
          name="cvFile"
          type="file"
          accept="application/pdf"
          disabled
          className="cursor-not-allowed"
          aria-invalid={!!cvError}
          aria-describedby={cvError ? "public-intake-cv-error" : undefined}
        />
        <Typography.SubCaption className="text-muted-foreground italic">
          CV upload is disabled in Beta
        </Typography.SubCaption>
        {cvError ? (
          <Typography.SubCaption
            id="public-intake-cv-error"
            className="text-destructive"
          >
            {cvError}
          </Typography.SubCaption>
        ) : null}
      </div>

      {state.status === "error" && state.message ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
          <Typography.Caption className="text-destructive">
            {state.message}
          </Typography.Caption>
        </div>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full" size="lg">
        {isPending ? "Starting interview..." : "Start interview"}
      </Button>
    </form>
  );
}
