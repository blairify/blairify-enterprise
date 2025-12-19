import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { candidates, users } from "@/db/schema/auth";
import { signupEnterpriseAdmin } from "@/lib/blairify-auth-service";
import { clearSessionCookie, createSession } from "@/lib/session";
import { signupRequestExample } from "@/lib/validation/blairify-auth";

jest.mock("@/lib/rate-limit", () => {
  class RateLimitError extends Error {
    constructor() {
      super("RATE_LIMITED");
      this.name = "RateLimitError";
    }
  }

  return {
    enforceRateLimit: jest.fn(),
    RateLimitError,
  } as unknown;
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { enforceRateLimit, RateLimitError } = require("@/lib/rate-limit") as {
  enforceRateLimit: jest.Mock;
  RateLimitError: new () => Error;
};

const globalAny = globalThis as unknown as {
  Response?: {
    json: (body: unknown, init?: { status?: number }) => Response;
  };
};

if (!globalAny.Response) {
  globalAny.Response = {
    json: (body: unknown, init?: { status?: number }) =>
      ({
        status: init?.status ?? 200,
        json: async () => body,
      }) as unknown as Response,
  };
}

function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildRequest(body: unknown): Request {
  const req = {
    json: async () => body,
  } as Request;

  return req;
}

describe("/api/blairify/v1/candidates", () => {
  beforeEach(async () => {
    await clearSessionCookie();
  });

  it("returns 401 when unauthenticated", async () => {
    const { POST } = await import("../route");
    const req = buildRequest({
      fullName: "Test Candidate",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("UNAUTHENTICATED");
  });

  it("returns 403 when authenticated user lacks manage_candidates permission", async () => {
    const { POST } = await import("../route");
    const suffix = uniqueSuffix();
    const domain = `forbidden-candidates-${suffix}.example.com`;
    const adminEmail = `admin-${suffix}@${domain}`;

    const signupInput = {
      ...signupRequestExample,
      email: adminEmail,
      companyDomain: domain,
    };

    const signupResult = await signupEnterpriseAdmin(signupInput);

    if (!signupResult.ok) {
      throw new Error(
        `Signup failed in forbidden candidates test: ${signupResult.error}`,
      );
    }

    const enterprise = signupResult.value.enterprise;

    await clearSessionCookie();

    const recruiterEmail = `recruiter-${suffix}@${domain}`;

    const [recruiter] = await db
      .insert(users)
      .values({
        enterpriseId: enterprise.id,
        email: recruiterEmail,
        passwordHash: "test-hash",
        fullName: "Read Only User",
        jobTitle: "Viewer",
        role: "READ_ONLY",
      })
      .returning();

    if (!recruiter) {
      throw new Error("Failed to create read-only user for forbidden test");
    }

    await createSession(recruiter);

    const req = buildRequest({
      fullName: "Candidate Name",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toBe("FORBIDDEN");
  });

  it("returns 400 on validation error", async () => {
    const { POST } = await import("../route");
    const suffix = uniqueSuffix();
    const domain = `validation-candidates-${suffix}.example.com`;
    const adminEmail = `admin-${suffix}@${domain}`;

    const signupInput = {
      ...signupRequestExample,
      email: adminEmail,
      companyDomain: domain,
    };

    const signupResult = await signupEnterpriseAdmin(signupInput);

    if (!signupResult.ok) {
      throw new Error(
        `Signup failed in validation-error candidates test: ${signupResult.error}`,
      );
    }

    const req = buildRequest({});

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("VALIDATION_ERROR");
  });

  it("returns 201 and candidate data for enterprise admin creating a candidate", async () => {
    const { POST } = await import("../route");
    const suffix = uniqueSuffix();
    const domain = `success-candidates-${suffix}.example.com`;
    const adminEmail = `admin-${suffix}@${domain}`;

    const signupInput = {
      ...signupRequestExample,
      email: adminEmail,
      companyDomain: domain,
    };

    const signupResult = await signupEnterpriseAdmin(signupInput);

    if (!signupResult.ok) {
      throw new Error(
        `Signup failed in success candidates test: ${signupResult.error}`,
      );
    }

    const enterprise = signupResult.value.enterprise;
    const adminUser = signupResult.value.user;

    await clearSessionCookie();
    await createSession(adminUser);

    const createPayload = {
      fullName: "Candidate Name",
      email: `candidate-${suffix}@${domain}`,
      headline: "Senior Frontend Engineer",
      location: "Remote",
      seniority: "Senior",
      currentCompany: "Acme Corp",
      linkedInUrl: "https://www.linkedin.com/in/candidate",
      githubUrl: "https://github.com/candidate",
      cvUrl: "https://example.com/cv/candidate.pdf",
      notes: "Strong frontend experience.",
    } as const;

    const req = buildRequest(createPayload);

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.candidate.fullName).toBe(createPayload.fullName);
    expect(json.candidate.email).toBe(createPayload.email);
    expect(json.candidate.id).toBeDefined();

    const created = await db
      .select()
      .from(candidates)
      .where(eq(candidates.enterpriseId, enterprise.id));

    expect(created.length).toBeGreaterThan(0);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    const { POST } = await import("../route");
    const suffix = uniqueSuffix();
    const domain = `rate-limit-candidates-${suffix}.example.com`;
    const adminEmail = `admin-${suffix}@${domain}`;

    const signupInput = {
      ...signupRequestExample,
      email: adminEmail,
      companyDomain: domain,
    };

    const signupResult = await signupEnterpriseAdmin(signupInput);

    if (!signupResult.ok) {
      throw new Error(
        `Signup failed in rate-limit candidates test: ${signupResult.error}`,
      );
    }

    await clearSessionCookie();
    await createSession(signupResult.value.user);

    enforceRateLimit.mockReset();

    enforceRateLimit.mockImplementation(() => {
      throw new RateLimitError();
    });

    const req = buildRequest({
      fullName: "Test Candidate",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.error).toBe("RATE_LIMITED");
  });
});
