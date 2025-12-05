import { createCandidate } from "@/lib/candidates-service";
import { requirePermission } from "@/lib/permissions";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import { getCurrentAuth } from "@/lib/session";
import {
  type CreateCandidateRequest,
  createCandidateSchema,
} from "@/lib/validation/candidates";

export async function POST(request: Request): Promise<Response> {
  try {
    await enforceRateLimit("create_candidate_api");
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
    requirePermission(auth.user, "manage_candidates");
  } catch {
    return Response.json(
      {
        error: "FORBIDDEN",
        message: "You do not have permission to manage candidates.",
      },
      { status: 403 },
    );
  }

  const json = (await request.json().catch(() => null)) as unknown;

  const parsed = createCandidateSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      {
        error: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }

  const input: CreateCandidateRequest = parsed.data;

  const result = await createCandidate(auth.enterprise.id, input);

  const candidate = result.value;

  return Response.json(
    {
      candidate: {
        id: candidate.id,
        fullName: candidate.fullName,
        email: candidate.email,
        headline: candidate.headline,
        location: candidate.location,
        seniority: candidate.seniority,
        currentCompany: candidate.currentCompany,
        linkedInUrl: candidate.linkedInUrl,
        githubUrl: candidate.githubUrl,
        cvUrl: candidate.cvUrl,
        notes: candidate.notes,
        createdAt: candidate.createdAt,
      },
    },
    { status: 201 },
  );
}
