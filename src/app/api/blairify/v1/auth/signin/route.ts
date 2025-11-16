import { signinUser } from "@/lib/blairify-auth-service";
import { signinRequestSchema } from "@/lib/validation/blairify-auth";

export async function POST(request: Request): Promise<Response> {
  const json = await request.json().catch(() => null);

  const parsed = signinRequestSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      {
        error: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }

  const result = await signinUser(parsed.data);

  if (!result.ok) {
    switch (result.error) {
      case "INVALID_EMAIL_DOMAIN": {
        return Response.json(
          {
            error: result.error,
            message: result.message,
          },
          { status: 400 },
        );
      }
      case "INVALID_CREDENTIALS": {
        return Response.json(
          {
            error: result.error,
            message: result.message,
          },
          { status: 401 },
        );
      }
      case "USER_INACTIVE": {
        return Response.json(
          {
            error: result.error,
            message: result.message,
          },
          { status: 403 },
        );
      }
      default: {
        const _never: never = result.error;
        throw new Error(`Unhandled signin error in API: ${_never}`);
      }
    }
  }

  const { enterprise, user } = result.value;

  return Response.json(
    {
      enterprise: {
        id: enterprise.id,
        name: enterprise.name,
        domain: enterprise.domain,
      },
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    },
    { status: 200 },
  );
}
