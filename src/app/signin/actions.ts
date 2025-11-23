"use server";

import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { signinUser } from "@/lib/blairify-auth-service";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import {
  type SigninRequest,
  signinRequestSchema,
} from "@/lib/validation/blairify-auth";

export type SigninFormValues = SigninRequest;

export type SigninFormState = {
  status: "idle" | "error";
  message: string | null;
  fieldErrors: Partial<Record<keyof SigninFormValues, string[]>>;
};

function zodErrorToFieldErrors(
  error: ZodError<SigninFormValues>,
): Partial<Record<keyof SigninFormValues, string[]>> {
  const fieldErrors: Partial<Record<keyof SigninFormValues, string[]>> = {};

  for (const issue of error.issues) {
    const pathKey = issue.path[0];

    if (typeof pathKey !== "string") {
      continue;
    }

    const key = pathKey as keyof SigninFormValues;

    if (!fieldErrors[key]) {
      fieldErrors[key] = [];
    }

    fieldErrors[key]?.push(issue.message);
  }

  return fieldErrors;
}

export async function signinAction(
  _prevState: SigninFormState,
  formData: FormData,
): Promise<SigninFormState> {
  try {
    await enforceRateLimit("signin");
  } catch (error) {
    if (error instanceof RateLimitError) {
      return {
        status: "error",
        message: "Too many attempts. Please try again later.",
        fieldErrors: {},
      };
    }
    throw error;
  }

  const rawValues = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signinRequestSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted errors and try again.",
      fieldErrors: zodErrorToFieldErrors(parsed.error),
    };
  }

  const values = parsed.data;

  const result = await signinUser(values);

  if (!result.ok) {
    switch (result.error) {
      case "INVALID_EMAIL_DOMAIN": {
        return {
          status: "error",
          message: result.message,
          fieldErrors: {
            email: ["Enter a valid work email"],
          },
        };
      }
      case "INVALID_CREDENTIALS": {
        return {
          status: "error",
          message: result.message,
          fieldErrors: {
            email: ["Invalid email or password"],
            password: ["Invalid email or password"],
          },
        };
      }
      case "USER_INACTIVE": {
        return {
          status: "error",
          message: result.message,
          fieldErrors: {
            email: [result.message],
          },
        };
      }
      default: {
        const _never: never = result.error;
        throw new Error(`Unhandled signin error: ${_never}`);
      }
    }
  }

  redirect("/dashboard");
}
