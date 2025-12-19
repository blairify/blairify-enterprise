import { describe, expect, it, jest } from "@jest/globals";

import {
  publicInterviewAttempts,
  publicInterviewCandidates,
} from "@/db/schema/auth";

const dbMock: Record<string, unknown> = {};

const withEnterpriseDbMock =
  jest.fn<
    (
      enterpriseId: string,
      fn: (tenantDb: Record<string, unknown>) => Promise<unknown>,
    ) => Promise<unknown>
  >();

withEnterpriseDbMock.mockImplementation(async (_enterpriseId, fn) =>
  fn(dbMock),
);

jest.mock("@/db/client", () => ({
  db: dbMock,
  withEnterpriseDb: withEnterpriseDbMock,
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const enforceRateLimitMock = jest.fn<(key: string) => Promise<void>>();

class RateLimitError extends Error {
  constructor() {
    super("RATE_LIMITED");
    this.name = "RateLimitError";
  }
}

jest.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: enforceRateLimitMock,
  RateLimitError,
}));

describe("submitPublicInterviewIntakeAction", () => {
  it("returns error when link not found", async () => {
    const { submitPublicInterviewIntakeAction } = await import("../actions");

    enforceRateLimitMock.mockResolvedValue(undefined);

    dbMock.select = jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve([] as unknown[])),
        })),
      })),
    }));

    const formData = new FormData();
    formData.set("firstName", "A");
    formData.set("lastName", "B");
    formData.set("email", "a@b.com");
    formData.set("phone", "+1 111");
    formData.set("location", "City");

    const result = await submitPublicInterviewIntakeAction(
      "missing",
      { status: "idle", message: null, fieldErrors: {} },
      formData,
    );

    expect(result).toEqual({
      status: "error",
      message: "This interview link is invalid or expired.",
      fieldErrors: {},
    });
  });

  it("creates candidate + attempt and returns attemptUrl", async () => {
    const { submitPublicInterviewIntakeAction } = await import("../actions");

    enforceRateLimitMock.mockResolvedValue(undefined);

    const link = { id: "link-id", enterpriseId: "ent" };

    const insertCandidateReturning = jest
      .fn<() => Promise<Array<{ id: string }>>>()
      .mockResolvedValue([{ id: "cand-id" }]);

    const insertAttemptReturning = jest
      .fn<() => Promise<Array<{ id: string }>>>()
      .mockResolvedValue([{ id: "attempt-id" }]);

    dbMock.select = jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve([link] as unknown[])),
        })),
      })),
    }));

    dbMock.insert = jest.fn((table: unknown) => {
      const returning =
        table === publicInterviewCandidates
          ? insertCandidateReturning
          : table === publicInterviewAttempts
            ? insertAttemptReturning
            : insertAttemptReturning;

      return {
        values: jest.fn(() => ({
          onConflictDoNothing: jest.fn(() => ({
            returning,
          })),
        })),
      };
    });

    const formData = new FormData();
    formData.set("firstName", "A");
    formData.set("lastName", "B");
    formData.set("email", "a@b.com");
    formData.set("phone", "+1 111");
    formData.set("location", "City");

    const result = await submitPublicInterviewIntakeAction(
      "publicid",
      { status: "idle", message: null, fieldErrors: {} },
      formData,
    );

    expect(result).toEqual({
      status: "success",
      message: null,
      fieldErrors: {},
      attemptUrl: "/i/publicid/attempt/attempt-id",
    });
  });
});
