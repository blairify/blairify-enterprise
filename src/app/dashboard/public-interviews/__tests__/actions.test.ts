import { describe, expect, it, jest } from "@jest/globals";

import type { User } from "@/db/schema/auth";

const dbMock: Record<string, unknown> = {};

jest.mock("@/db/client", () => ({
  db: dbMock,
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const requireAuthMock = jest.fn<(...args: unknown[]) => Promise<unknown>>();

jest.mock("@/lib/server-auth", () => ({
  requireAuth: (...args: unknown[]) => requireAuthMock(...args),
}));

const requirePermissionMock = jest.fn<(...args: unknown[]) => void>();

jest.mock("@/lib/permissions", () => ({
  requirePermission: (...args: unknown[]) => requirePermissionMock(...args),
}));

function buildUser(overrides: Partial<User>): User {
  const now = new Date();

  return {
    id: "user-id",
    enterpriseId: "enterprise-id",
    email: "recruiter@example.com",
    passwordHash: "hash",
    fullName: "Recruiter",
    jobTitle: "Recruiter",
    role: "RECRUITER",
    createdAt: now,
    isActive: true,
    ...overrides,
  };
}

describe("createPublicInterviewLinkAction", () => {
  it("returns error for invalid plan JSON", async () => {
    const { createPublicInterviewLinkAction } = await import("../actions");

    requireAuthMock.mockResolvedValue({
      user: buildUser({}),
      enterprise: {
        id: "enterprise-id",
        name: "Enterprise",
        domain: "e.com",
        createdAt: new Date(),
      },
      session: {
        id: "s",
        userId: "u",
        enterpriseId: "enterprise-id",
        createdAt: new Date(),
        expiresAt: new Date(),
        ipAddress: null,
        userAgent: null,
      },
    } as unknown);

    requirePermissionMock.mockImplementation(() => undefined);

    dbMock.insert = jest.fn();

    const formData = new FormData();
    formData.set("title", "Test link");
    formData.set("plan", "{broken");

    const result = await createPublicInterviewLinkAction(
      { status: "idle", message: null, fieldErrors: {} },
      formData,
    );

    expect(result).toEqual({
      status: "error",
      message: "Invalid interview plan payload.",
      fieldErrors: {},
    });
  });

  it("creates link and returns publicUrl", async () => {
    const { createPublicInterviewLinkAction } = await import("../actions");

    const originalEnv = process.env.NEXT_PUBLIC_BASE_URL;
    process.env.NEXT_PUBLIC_BASE_URL = "https://example.com";

    (globalThis as unknown as { crypto: { randomUUID: () => string } }).crypto =
      {
        randomUUID: () => "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      };

    requireAuthMock.mockResolvedValue({
      user: buildUser({ id: "recruiter-id" }),
      enterprise: {
        id: "enterprise-id",
        name: "Enterprise",
        domain: "e.com",
        createdAt: new Date(),
      },
      session: {
        id: "s",
        userId: "u",
        enterpriseId: "enterprise-id",
        createdAt: new Date(),
        expiresAt: new Date(),
        ipAddress: null,
        userAgent: null,
      },
    });

    requirePermissionMock.mockImplementation(() => undefined);

    const returningMock = jest
      .fn<() => Promise<Array<{ id: string }>>>()
      .mockResolvedValue([{ id: "row" }]);

    dbMock.insert = jest.fn(() => ({
      values: jest.fn(() => ({
        onConflictDoNothing: jest.fn(() => ({
          returning: returningMock,
        })),
      })),
    }));

    const formData = new FormData();
    formData.set("title", "Test link");
    formData.set(
      "plan",
      JSON.stringify({ summary: { position: "frontend" }, questions: [] }),
    );

    const result = await createPublicInterviewLinkAction(
      { status: "idle", message: null, fieldErrors: {} },
      formData,
    );

    process.env.NEXT_PUBLIC_BASE_URL = originalEnv;

    expect(result.status).toBe("success");
    expect(result.message).toBe("Public link created.");
    expect(result.fieldErrors).toEqual({});
    expect(result.linkId).toBe("row");

    expect(typeof result.publicId).toBe("string");
    expect(result.publicId?.length).toBe(16);
    expect(result.publicUrl).toBe(`https://example.com/i/${result.publicId}`);
  });
});
