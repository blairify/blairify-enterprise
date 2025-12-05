import { createOrganisation } from "@/lib/organisations-service";
import { requirePermission } from "@/lib/permissions";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import { getCurrentAuth } from "@/lib/session";
import {
  type CreateOrganisationRequest,
  createOrganisationSchema,
} from "@/lib/validation/organisations";

export async function POST(request: Request): Promise<Response> {
  try {
    await enforceRateLimit("create_organisation_api");
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
    requirePermission(auth.user, "manage_organisations");
  } catch {
    return Response.json(
      {
        error: "FORBIDDEN",
        message: "You do not have permission to manage organisations.",
      },
      { status: 403 },
    );
  }

  const json = (await request.json().catch(() => null)) as unknown;

  const parsed = createOrganisationSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      {
        error: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }

  const input: CreateOrganisationRequest = parsed.data;

  const result = await createOrganisation(auth.enterprise.id, input);

  if (!result.ok) {
    switch (result.error) {
      case "ORGANISATION_NAME_EXISTS": {
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
        throw new Error(
          `Unhandled create organisation error in API: ${_never}`,
        );
      }
    }
  }

  const organisation = result.value;

  return Response.json(
    {
      organisation: {
        id: organisation.id,
        name: organisation.name,
        description: organisation.description,
        industry: organisation.industry,
        location: organisation.location,
        size: organisation.size,
        website: organisation.website,
        hiringFocus: organisation.hiringFocus,
        createdAt: organisation.createdAt,
      },
    },
    { status: 201 },
  );
}
