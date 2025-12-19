import { describe, expect, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const generateTestInterviewAnswerFeedbackMock =
  jest.fn<(...args: unknown[]) => Promise<string>>();

jest.mock("@/app/dashboard/build-interview/test-interview-actions", () => ({
  generateTestInterviewAnswerFeedback: (...args: unknown[]) =>
    generateTestInterviewAnswerFeedbackMock(...args),
}));

jest.mock("@/components/common/atoms/interviewer-avatar", () => ({
  InterviewerAvatar: () => null,
}));

describe("TestInterviewRunner", () => {
  it("passes interviewerId through to generateTestInterviewAnswerFeedback", async () => {
    generateTestInterviewAnswerFeedbackMock.mockResolvedValue("ok");

    const user = userEvent.setup();

    if (!global.crypto) {
      // @ts-expect-error - test shim
      global.crypto = {};
    }

    if (!global.crypto.randomUUID) {
      // @ts-expect-error - test shim
      global.crypto.randomUUID = () => "uuid";
    }

    window.localStorage.setItem(
      "blairify-enterprise:test-interview-plan",
      JSON.stringify({
        summary: {
          position: "backend",
          seniority: "mid",
          companyProfile: "Acme",
          mode: "regular",
          notes: "",
          duration: "30",
          stack: "Node",
        },
        interviewerId: "marcus",
        questions: [{ id: "q1", source: "ai", prompt: "Explain CAP theorem." }],
      }),
    );

    const { TestInterviewRunner } = await import("../test-interview-runner");

    render(<TestInterviewRunner />);

    const input = await screen.findByLabelText("Your answer");
    await user.type(input, "My answer");

    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(generateTestInterviewAnswerFeedbackMock).toHaveBeenCalledTimes(1);
    });

    expect(generateTestInterviewAnswerFeedbackMock).toHaveBeenCalledWith(
      expect.objectContaining({
        interviewerId: "marcus",
      }),
    );
  });
});
