import { signupEnterpriseAdmin } from "@/lib/blairify-auth-service";
import { signupRequestSchema } from "@/lib/validation/blairify-auth";

export async function POST(request: Request): Promise<Response> {
  const json = await request.json().catch(() => null);

  const parsed = signupRequestSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      {
        error: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }

  const result = await signupEnterpriseAdmin(parsed.data);

  if (!result.ok) {
    switch (result.error) {
      case "ENTERPRISE_DOMAIN_EXISTS": {
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
        throw new Error(`Unhandled signup error in API: ${_never}`);
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
    { status: 201 },
  );
}
