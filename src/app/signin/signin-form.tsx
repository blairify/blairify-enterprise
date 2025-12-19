"use client";

import { useActionState } from "react";

import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type SigninFormState, signinAction } from "./actions";

function fieldError(
  state: SigninFormState,
  field: keyof SigninFormState["fieldErrors"],
) {
  const errors = state.fieldErrors[field];

  if (!errors || errors.length === 0) {
    return null;
  }

  return errors[0];
}

export function SigninForm() {
  const signinInitialState: SigninFormState = {
    status: "idle",
    message: null,
    fieldErrors: {},
  };

  const [state, formAction, isPending] = useActionState(
    signinAction,
    signinInitialState,
  );

  const emailError = fieldError(state, "email");
  const passwordError = fieldError(state, "password");

  return (
    <form
      action={formAction}
      className="space-y-6"
      aria-describedby={state.message ? "signin-form-message" : undefined}
    >
      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!emailError}
          aria-describedby={emailError ? "signin-email-error" : undefined}
        />
        {emailError ? (
          <Typography.Body
            id="signin-email-error"
            className="text-sm text-destructive"
          >
            {emailError}
          </Typography.Body>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!passwordError}
          aria-describedby={passwordError ? "signin-password-error" : undefined}
        />
        {passwordError ? (
          <Typography.Body
            id="signin-password-error"
            className="text-sm text-destructive"
          >
            {passwordError}
          </Typography.Body>
        ) : null}
      </div>

      {state.status === "error" && state.message ? (
        <Typography.Body
          id="signin-form-message"
          className="text-sm text-destructive"
          aria-live="polite"
        >
          {state.message}
        </Typography.Body>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

export default SigninForm;
