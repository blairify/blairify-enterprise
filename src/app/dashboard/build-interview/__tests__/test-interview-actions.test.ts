import { describe, expect, it, jest } from "@jest/globals";

const mistralCompleteMock = jest.fn<(...args: unknown[]) => Promise<unknown>>();

type MistralCallArg = {
  messages?: Array<{ content?: unknown }>;
};

jest.mock("@mistralai/mistralai", () => ({
  Mistral: jest.fn(() => ({
    chat: {
      complete: (...args: unknown[]) => mistralCompleteMock(...args),
    },
  })),
}));

describe("generateTestInterviewAnswerFeedback", () => {
  it("includes interviewer persona fields in the prompt (explicit interviewerId)", async () => {
    const { generateTestInterviewAnswerFeedback } = await import(
      "../test-interview-actions"
    );

    process.env.MISTRAL_API_KEY = "key";

    mistralCompleteMock.mockResolvedValue({
      choices: [{ message: { content: "ok" } }],
    });

    await generateTestInterviewAnswerFeedback({
      summary: {
        position: "frontend",
        seniority: "mid",
        companyProfile: "Acme",
        mode: "regular",
        notes: "",
        duration: "30",
        stack: "React",
      },
      interviewerId: "marcus",
      question: "Q?",
      answer: "A",
    });

    expect(mistralCompleteMock).toHaveBeenCalledTimes(1);

    const call = mistralCompleteMock.mock.calls[0];
    const arg0 = call?.[0] as MistralCallArg | undefined;
    const content = String(arg0?.messages?.[0]?.content ?? "");

    expect(content).toContain("You are Marcus");
    expect(content).toContain("Interviewer persona:");
    expect(content).toContain("Personality:");
    expect(content).toContain("Specialties:");
  });

  it("falls back to role-based interviewer when interviewerId is missing", async () => {
    const { generateTestInterviewAnswerFeedback } = await import(
      "../test-interview-actions"
    );

    process.env.MISTRAL_API_KEY = "key";

    mistralCompleteMock.mockResolvedValue({
      choices: [{ message: { content: "ok" } }],
    });

    await generateTestInterviewAnswerFeedback({
      summary: {
        position: "backend",
        seniority: "mid",
        companyProfile: "Acme",
        mode: "regular",
        notes: "",
        duration: "30",
        stack: "Node",
      },
      question: "Q?",
      answer: "A",
    });

    const call = mistralCompleteMock.mock.calls.at(-1);
    const arg0 = call?.[0] as MistralCallArg | undefined;
    const content = String(arg0?.messages?.[0]?.content ?? "");

    expect(content).toContain("You are Marcus");
  });
});
