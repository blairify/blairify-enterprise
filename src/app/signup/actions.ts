"use server";

import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { signupEnterpriseAdmin } from "@/lib/blairify-auth-service";
import {
  type SignupRequest,
  signupRequestSchema,
} from "@/lib/validation/blairify-auth";

export type SignupFormValues = SignupRequest;

export type SignupFormState = {
  status: "idle" | "error";
  message: string | null;
  fieldErrors: Record<string, string[]>;
};

function zodErrorToFieldErrors(
  error: ZodError<SignupFormValues>,
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const pathKey = issue.path[0];

    if (typeof pathKey !== "string") {
      continue;
    }

    if (!fieldErrors[pathKey]) {
      fieldErrors[pathKey] = [];
    }

    fieldErrors[pathKey].push(issue.message);
  }

  return fieldErrors;
}

export async function signupAction(
  _prevState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const rawValues = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    companyName: formData.get("companyName"),
    companyDomain: formData.get("companyDomain"),
    jobTitle: formData.get("jobTitle"),
  };

  const parsed = signupRequestSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted errors and try again.",
      fieldErrors: zodErrorToFieldErrors(parsed.error),
    };
  }

  const values = parsed.data;

  const result = await signupEnterpriseAdmin(values);

  if (!result.ok) {
    switch (result.error) {
      case "ENTERPRISE_DOMAIN_EXISTS": {
        return {
          status: "error",
          message: result.message,
          fieldErrors: {
            companyDomain: [result.message],
          },
        };
      }
      default: {
        const _never: never = result.error;
        throw new Error(`Unhandled signup error: ${_never}`);
      }
    }
  }

  redirect("/dashboard");
}
