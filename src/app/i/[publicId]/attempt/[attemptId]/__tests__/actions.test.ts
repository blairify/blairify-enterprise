import { describe, expect, it, jest } from "@jest/globals";

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

const mistralCompleteMock = jest.fn<(...args: unknown[]) => Promise<unknown>>();

jest.mock("@mistralai/mistralai", () => ({
  Mistral: jest.fn(() => ({
    chat: {
      complete: (...args: unknown[]) => mistralCompleteMock(...args),
    },
  })),
}));

describe("completePublicInterviewAttemptAction", () => {
  it("writes scores + analysis on success", async () => {
    const { completePublicInterviewAttemptAction } = await import("../actions");

    process.env.MISTRAL_API_KEY = "key";

    mistralCompleteMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              decision: "PASS",
              overallScore: 88,
              hireRecommendation: "yes",
              summary: "Strong candidate",
              strengths: ["s"],
              concerns: ["c"],
              nextSteps: ["n"],
            }),
          },
        },
      ],
    });

    const updateSetMock = jest.fn<(values: unknown) => unknown>(() => ({
      where: jest
        .fn<(arg: unknown) => Promise<void>>()
        .mockResolvedValue(undefined),
    }));

    let selectCount = 0;

    dbMock.select = jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => {
            selectCount += 1;

            if (selectCount === 1) {
              return Promise.resolve([
                { id: "link-id", enterpriseId: "ent" },
              ] as unknown[]);
            }

            return Promise.resolve([{ id: "attempt" }] as unknown[]);
          }),
        })),
      })),
    }));

    dbMock.update = jest.fn(() => ({
      set: updateSetMock,
    }));

    await completePublicInterviewAttemptAction({
      publicId: "public",
      attemptId: "attempt",
      answers: [{ questionId: "q", prompt: "p", answer: "a" }],
    });

    expect(updateSetMock).toHaveBeenCalledWith({
      status: "completed",
      completedAt: expect.any(Date),
      answers: [{ questionId: "q", prompt: "p", answer: "a" }],
      scores: { decision: "PASS", overallScore: 88, hireRecommendation: "yes" },
      analysis: {
        decision: "PASS",
        overallScore: 88,
        hireRecommendation: "yes",
        summary: "Strong candidate",
        strengths: ["s"],
        concerns: ["c"],
        nextSteps: ["n"],
      },
    });
  });
});
