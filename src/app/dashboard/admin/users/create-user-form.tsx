"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type CreateUserFormState, createUserAction } from "./actions";

function fieldError(
  state: CreateUserFormState,
  field: keyof CreateUserFormState["fieldErrors"],
) {
  const errors = state.fieldErrors[field];

  if (!errors || errors.length === 0) {
    return null;
  }

  return errors[0];
}

const initialState: CreateUserFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(
    createUserAction,
    initialState,
  );

  const fullNameError = fieldError(state, "fullName");
  const emailError = fieldError(state, "email");
  const passwordError = fieldError(state, "password");
  const jobTitleError = fieldError(state, "jobTitle");
  const roleError = fieldError(state, "role");

  const isError = state.status === "error" && state.message;
  const isSuccess = state.status === "success" && state.message;

  return (
    <form
      action={formAction}
      className="space-y-6"
      aria-describedby={state.message ? "create-user-form-message" : undefined}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            aria-invalid={!!fullNameError}
            aria-describedby={
              fullNameError ? "create-user-fullName-error" : undefined
            }
          />
          {fullNameError ? (
            <p
              id="create-user-fullName-error"
              className="text-sm text-destructive"
            >
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
            aria-describedby={
              emailError ? "create-user-email-error" : undefined
            }
          />
          {emailError ? (
            <p
              id="create-user-email-error"
              className="text-sm text-destructive"
            >
              {emailError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Temporary password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!passwordError}
            aria-describedby={
              passwordError ? "create-user-password-error" : undefined
            }
          />
          {passwordError ? (
            <p
              id="create-user-password-error"
              className="text-sm text-destructive"
            >
              {passwordError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job title</Label>
          <Input
            id="jobTitle"
            name="jobTitle"
            aria-invalid={!!jobTitleError}
            aria-describedby={
              jobTitleError ? "create-user-jobTitle-error" : undefined
            }
          />
          {jobTitleError ? (
            <p
              id="create-user-jobTitle-error"
              className="text-sm text-destructive"
            >
              {jobTitleError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="role">Role</Label>
          <Select name="role" defaultValue="RECRUITER">
            <SelectTrigger
              id="role"
              aria-invalid={!!roleError}
              aria-describedby={
                roleError ? "create-user-role-error" : undefined
              }
              className="w-full"
            >
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RECRUITER">Recruiter</SelectItem>
              <SelectItem value="READ_ONLY">Read only</SelectItem>
              <SelectItem value="ENTERPRISE_ADMIN">Enterprise admin</SelectItem>
            </SelectContent>
          </Select>
          {roleError ? (
            <p id="create-user-role-error" className="text-sm text-destructive">
              {roleError}
            </p>
          ) : null}
        </div>
      </div>

      {isError ? (
        <p
          id="create-user-form-message"
          className="text-sm text-destructive"
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}

      {isSuccess ? (
        <p
          id="create-user-form-message"
          className="text-sm text-emerald-600 dark:text-emerald-400"
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating user..." : "Create user"}
      </Button>
    </form>
  );
}

export default CreateUserForm;
