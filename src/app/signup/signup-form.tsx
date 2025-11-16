"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type SignupFormState, signupAction } from "./actions";

function fieldError(
  state: SignupFormState,
  field: keyof SignupFormState["fieldErrors"],
) {
  const errors = state.fieldErrors[field];

  if (!errors || errors.length === 0) {
    return null;
  }

  return errors[0];
}

export function SignupForm() {
  const signupInitialState: SignupFormState = {
    status: "idle",
    message: null,
    fieldErrors: {},
  };

  const [state, formAction, isPending] = useActionState(
    signupAction,
    signupInitialState,
  );

  const fullNameError = fieldError(state, "fullName");
  const emailError = fieldError(state, "email");
  const passwordError = fieldError(state, "password");
  const confirmPasswordError = fieldError(state, "confirmPassword");
  const companyNameError = fieldError(state, "companyName");
  const companyDomainError = fieldError(state, "companyDomain");
  const jobTitleError = fieldError(state, "jobTitle");

  return (
    <form
      action={formAction}
      className="space-y-6"
      aria-describedby={state.message ? "signup-form-message" : undefined}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            aria-invalid={!!fullNameError}
            aria-describedby={fullNameError ? "fullName-error" : undefined}
          />
          {fullNameError ? (
            <p id="fullName-error" className="text-sm text-destructive">
              {fullNameError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          {emailError ? (
            <p id="email-error" className="text-sm text-destructive">
              {emailError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? "password-error" : undefined}
          />
          {passwordError ? (
            <p id="password-error" className="text-sm text-destructive">
              {passwordError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!confirmPasswordError}
            aria-describedby={
              confirmPasswordError ? "confirmPassword-error" : undefined
            }
          />
          {confirmPasswordError ? (
            <p id="confirmPassword-error" className="text-sm text-destructive">
              {confirmPasswordError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">Company name</Label>
          <Input
            id="companyName"
            name="companyName"
            autoComplete="organization"
            aria-invalid={!!companyNameError}
            aria-describedby={
              companyNameError ? "companyName-error" : undefined
            }
          />
          {companyNameError ? (
            <p id="companyName-error" className="text-sm text-destructive">
              {companyNameError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyDomain">Company domain</Label>
          <Input
            id="companyDomain"
            name="companyDomain"
            placeholder="acme.com"
            aria-invalid={!!companyDomainError}
            aria-describedby={
              companyDomainError ? "companyDomain-error" : undefined
            }
          />
          {companyDomainError ? (
            <p id="companyDomain-error" className="text-sm text-destructive">
              {companyDomainError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="jobTitle">Your role/position</Label>
          <Input
            id="jobTitle"
            name="jobTitle"
            placeholder="Head of Talent"
            aria-invalid={!!jobTitleError}
            aria-describedby={jobTitleError ? "jobTitle-error" : undefined}
          />
          {jobTitleError ? (
            <p id="jobTitle-error" className="text-sm text-destructive">
              {jobTitleError}
            </p>
          ) : null}
        </div>
      </div>

      {state.status === "error" && state.message ? (
        <p
          id="signup-form-message"
          className="text-sm text-destructive"
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Create enterprise account"}
      </Button>
    </form>
  );
}

export default SignupForm;
