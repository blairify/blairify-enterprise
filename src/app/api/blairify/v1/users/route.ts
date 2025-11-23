import { createEnterpriseUser } from "@/lib/blairify-auth-service";
import { requirePermission } from "@/lib/permissions";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import { getCurrentAuth } from "@/lib/session";
import {
  type CreateEnterpriseUserRequest,
  createEnterpriseUserSchema,
} from "@/lib/validation/blairify-auth";

export async function POST(request: Request): Promise<Response> {
  try {
    await enforceRateLimit("create_user_api");
  } catch (error) {
    if (error instanceof RateLimitError) {
      return Response.json(
        {
          error: "RATE_LIMITED",
          message: "Too many attempts. Please try again later.",
        },
        { status: 429 },
      );
    }
    throw error;
  }

  const auth = await getCurrentAuth();

  if (!auth) {
    return Response.json(
      { error: "UNAUTHENTICATED", message: "Signin required." },
      { status: 401 },
    );
  }

  try {
    requirePermission(auth.user, "manage_users");
  } catch {
    return Response.json(
      {
        error: "FORBIDDEN",
        message: "You do not have permission to manage users.",
      },
      { status: 403 },
    );
  }

  const json = (await request.json().catch(() => null)) as unknown;

  const parsed = createEnterpriseUserSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      {
        error: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }

  const input: CreateEnterpriseUserRequest = parsed.data;

  const result = await createEnterpriseUser(auth.enterprise.id, input);

  if (!result.ok) {
    switch (result.error) {
      case "EMAIL_ALREADY_EXISTS": {
        return Response.json(
          {
            error: result.error,
            message: result.message,
          },
          { status: 409 },
        );
      }
      default: {
        const _never: never = result.error;
        throw new Error(`Unhandled create user error in API: ${_never}`);
      }
    }
  }

  const user = result.value;

  return Response.json(
    {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        jobTitle: user.jobTitle,
        role: user.role,
        isActive: user.isActive,
      },
    },
    { status: 201 },
  );
}
