"use server";

import type { ZodError } from "zod";
import { createEnterpriseUser } from "@/lib/blairify-auth-service";
import { requirePermission } from "@/lib/permissions";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/server-auth";
import {
  type CreateEnterpriseUserRequest,
  createEnterpriseUserSchema,
} from "@/lib/validation/blairify-auth";

export type CreateUserFormValues = CreateEnterpriseUserRequest;

export type CreateUserFormState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: Partial<Record<keyof CreateUserFormValues, string[]>>;
};

function zodErrorToFieldErrors(
  error: ZodError<CreateUserFormValues>,
): Partial<Record<keyof CreateUserFormValues, string[]>> {
  const fieldErrors: Partial<Record<keyof CreateUserFormValues, string[]>> = {};

  for (const issue of error.issues) {
    const pathKey = issue.path[0];

    if (typeof pathKey !== "string") {
      continue;
    }

    const key = pathKey as keyof CreateUserFormValues;

    if (!fieldErrors[key]) {
      fieldErrors[key] = [];
    }

    fieldErrors[key]?.push(issue.message);
  }

  return fieldErrors;
}

export async function createUserAction(
  _prevState: CreateUserFormState,
  formData: FormData,
): Promise<CreateUserFormState> {
  try {
    await enforceRateLimit("create_user");
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
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    jobTitle: formData.get("jobTitle"),
    role: formData.get("role"),
  };

  const parsed = createEnterpriseUserSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted errors and try again.",
      fieldErrors: zodErrorToFieldErrors(parsed.error),
    };
  }

  const auth = await requireAuth();

  try {
    requirePermission(auth.user, "manage_users");
  } catch {
    return {
      status: "error",
      message: "You do not have permission to manage users.",
      fieldErrors: {},
    };
  }

  const values = parsed.data;

  const result = await createEnterpriseUser(auth.enterprise.id, values);

  if (!result.ok) {
    switch (result.error) {
      case "EMAIL_ALREADY_EXISTS": {
        return {
          status: "error",
          message: "Unable to create user.",
          fieldErrors: {
            email: ["Unable to create user."],
          },
        };
      }
      default: {
        const _never: never = result.error;
        throw new Error(`Unhandled create user error: ${_never}`);
      }
    }
  }

  return {
    status: "success",
    message: "User created successfully.",
    fieldErrors: {},
  };
}
