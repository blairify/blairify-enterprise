import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { db } from "@/db/client";
import { users } from "@/db/schema/auth";
import { signupEnterpriseAdmin } from "@/lib/blairify-auth-service";
import { clearSessionCookie, createSession } from "@/lib/session";
import { signupRequestExample } from "@/lib/validation/blairify-auth";
import { POST } from "../route";

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

describe("/api/blairify/v1/users", () => {
  beforeEach(async () => {
    await clearSessionCookie();
  });

  it("returns 401 when unauthenticated", async () => {
    const req = buildRequest({
      fullName: "Test User",
      email: "user@example.com",
      password: "Password!123",
      jobTitle: "Role",
      role: "RECRUITER",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("UNAUTHENTICATED");
  });

  it("returns 403 when authenticated user lacks manage_users permission", async () => {
    const suffix = uniqueSuffix();
    const domain = `forbidden-${suffix}.example.com`;
    const adminEmail = `admin-${suffix}@${domain}`;

    const signupInput = {
      ...signupRequestExample,
      email: adminEmail,
      companyDomain: domain,
    };

    const signupResult = await signupEnterpriseAdmin(signupInput);

    if (!signupResult.ok) {
      throw new Error(`Signup failed in forbidden test: ${signupResult.error}`);
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
        fullName: "Recruiter User",
        jobTitle: "Recruiter",
        role: "RECRUITER",
      })
      .returning();

    if (!recruiter) {
      throw new Error("Failed to create recruiter user for forbidden test");
    }

    await createSession(recruiter);

    const req = buildRequest({
      fullName: "Another User",
      email: `another-${suffix}@${domain}`,
      password: "Password!123",
      jobTitle: "Role",
      role: "RECRUITER",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toBe("FORBIDDEN");
  });

  it("returns 400 on validation error", async () => {
    const suffix = uniqueSuffix();
    const domain = `validation-${suffix}.example.com`;
    const adminEmail = `admin-${suffix}@${domain}`;

    const signupInput = {
      ...signupRequestExample,
      email: adminEmail,
      companyDomain: domain,
    };

    const signupResult = await signupEnterpriseAdmin(signupInput);

    if (!signupResult.ok) {
      throw new Error(
        `Signup failed in validation-error test: ${signupResult.error}`,
      );
    }

    const req = buildRequest({});

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("VALIDATION_ERROR");
  });

  it("returns 201 and user data for enterprise admin creating a user", async () => {
    const suffix = uniqueSuffix();
    const domain = `success-${suffix}.example.com`;
    const adminEmail = `admin-${suffix}@${domain}`;

    const signupInput = {
      ...signupRequestExample,
      email: adminEmail,
      companyDomain: domain,
    };

    const signupResult = await signupEnterpriseAdmin(signupInput);

    if (!signupResult.ok) {
      throw new Error(`Signup failed in success test: ${signupResult.error}`);
    }

    const createPayload = {
      fullName: "Recruiter User",
      email: `recruiter-${suffix}@${domain}`,
      password: "Password!123",
      jobTitle: "Recruiter",
      role: "RECRUITER" as const,
    };

    const req = buildRequest(createPayload);

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.user.email).toBe(createPayload.email.toLowerCase());
    expect(json.user.role).toBe("RECRUITER");
    expect(json.user.id).toBeDefined();
  });

  it("returns 409 when email already exists globally", async () => {
    const suffix = uniqueSuffix();
    const existingDomain = `existing-${suffix}.example.com`;
    const existingEmail = `existing-${suffix}@${existingDomain}`;

    const signupExistingInput = {
      ...signupRequestExample,
      email: existingEmail,
      companyDomain: existingDomain,
    };

    const existingResult = await signupEnterpriseAdmin(signupExistingInput);

    if (!existingResult.ok) {
      throw new Error(
        `Signup for existing user failed in conflict test: ${existingResult.error}`,
      );
    }

    await clearSessionCookie();

    const domain = `conflict-${suffix}.example.com`;
    const adminEmail = `admin-${suffix}@${domain}`;

    const signupAdminInput = {
      ...signupRequestExample,
      email: adminEmail,
      companyDomain: domain,
    };

    const signupAdminResult = await signupEnterpriseAdmin(signupAdminInput);

    if (!signupAdminResult.ok) {
      throw new Error(
        `Signup for admin failed in conflict test: ${signupAdminResult.error}`,
      );
    }

    const req = buildRequest({
      fullName: "Another User",
      email: existingEmail,
      password: "Password!123",
      jobTitle: "Role",
      role: "RECRUITER",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error).toBe("EMAIL_ALREADY_EXISTS");
  });

  it("returns 429 when rate limit is exceeded", async () => {
    enforceRateLimit.mockImplementationOnce(() => {
      throw new RateLimitError();
    });

    const req = buildRequest({
      fullName: "Test User",
      email: "rate-limited@example.com",
      password: "Password!123",
      jobTitle: "Role",
      role: "RECRUITER",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.error).toBe("RATE_LIMITED");
  });
});
