"use client";

import { ArrowUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type {
  AiChatMessage,
  AiPositionSummary,
} from "@/app/dashboard/build-interview/actions";
import {
  aiChatRespond,
  aiSummarizePosition,
} from "@/app/dashboard/build-interview/actions";
import { InterviewerAvatar } from "@/components/common/atoms/interviewer-avatar";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { INTERVIEWERS } from "@/lib/config/interviewers";
import {
  INTERVIEW_DURATIONS,
  POSITIONS,
  SENIORITY_LEVELS,
} from "./interview-config-constants";

type BuildInterviewPhase = "landing" | "firstPrompt" | "conversation";

export type QuickPickField = "position" | "seniority" | "duration";

export type QuickPickSelections = Record<QuickPickField, string | null>;

interface BuildInterviewAiChatProps {
  onSummary?: (summary: AiPositionSummary) => void;
  quickPickSelections: QuickPickSelections;
  onQuickPickSelectionsChange: (selections: QuickPickSelections) => void;
  isSending: boolean;
  onIsSendingChange: (value: boolean) => void;
  isSummarizing: boolean;
  onIsSummarizingChange: (value: boolean) => void;
  onSendMessageRef?: React.MutableRefObject<
    ((content: string) => Promise<void>) | null
  >;
}

export function BuildInterviewAiChat({
  onSummary,
  quickPickSelections,
  onQuickPickSelectionsChange,
  isSending,
  onIsSendingChange,
  isSummarizing,
  onIsSummarizingChange,
  onSendMessageRef,
}: BuildInterviewAiChatProps) {
  const interviewer = INTERVIEWERS[0];

  function normalizeMessageContent(value: string): string {
    return value
      .replace(/\s+/g, " ")
      .replace(/\s+([.,!?;:])/g, "$1")
      .trim();
  }

  const normalizeLabel = useCallback(
    (value: string | null | undefined): string | null => {
      if (!value) return null;
      const trimmed = value.trim();
      if (!trimmed || trimmed.toLowerCase() === "unknown") return null;
      return trimmed.toLowerCase();
    },
    [],
  );

  const matchOptionValue = useCallback(
    (
      value: string | null | undefined,
      options: { value: string; label: string }[],
    ) => {
      const normalized = normalizeLabel(value);
      if (!normalized) return null;

      const exact = options.find(
        (option) => normalizeLabel(option.label) === normalized,
      );
      if (exact) return exact.value;

      const contains = options.find((option) => {
        const label = normalizeLabel(option.label);
        return (
          !!label &&
          (label.includes(normalized) || normalized.includes(label)) &&
          normalized.length >= 3
        );
      });
      return contains?.value ?? null;
    },
    [normalizeLabel],
  );

  const matchDurationValue = useCallback(
    (value: string | null | undefined) => {
      const normalized = normalizeLabel(value);
      if (!normalized) return null;

      const option = INTERVIEW_DURATIONS.find((duration) => {
        const label = normalizeLabel(duration.label);
        return label === normalized;
      });

      if (option) return option.value;

      const matchMinutes = normalized.match(/(\d{2,3})/);
      if (matchMinutes) {
        const candidate = INTERVIEW_DURATIONS.find(
          (duration) => duration.value === matchMinutes[1],
        );
        if (candidate) return candidate.value;
      }

      return null;
    },
    [normalizeLabel],
  );

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: "assistant",
      content:
        "Tell me about the interview you want to build. For example: team context, role, seniority, tech stack, and what you want to assess.",
    },
  ]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AiPositionSummary | null>(null);
  const [phase, setPhase] = useState<BuildInterviewPhase>("landing");

  useEffect(() => {
    if (!summary) return;

    const updates: QuickPickSelections = { ...quickPickSelections };
    let changed = false;

    const nextPosition = matchOptionValue(summary.position, POSITIONS);
    const nextSeniority = matchOptionValue(summary.seniority, SENIORITY_LEVELS);
    const nextDuration = matchDurationValue(summary.duration);

    if (nextPosition && updates.position !== nextPosition) {
      updates.position = nextPosition;
      changed = true;
    }

    if (nextSeniority && updates.seniority !== nextSeniority) {
      updates.seniority = nextSeniority;
      changed = true;
    }

    if (nextDuration && updates.duration !== nextDuration) {
      updates.duration = nextDuration;
      changed = true;
    }

    if (changed) {
      onQuickPickSelectionsChange(updates);
    }
  }, [
    summary,
    matchOptionValue,
    matchDurationValue,
    quickPickSelections,
    onQuickPickSelectionsChange,
  ]);

  useEffect(() => {
    if (summary) {
      onSummary?.(summary);
    }
  }, [summary, onSummary]);

  async function updateSummary(
    currentMessages: AiChatMessage[],
  ): Promise<AiPositionSummary | null> {
    setError(null);
    onIsSummarizingChange(true);

    try {
      const result = await aiSummarizePosition(currentMessages);
      setSummary(result);
      return result;
    } catch {
      setError("Unable to summarize position right now. Please try again.");
      return null;
    } finally {
      onIsSummarizingChange(false);
    }
  }

  async function streamAssistantMessage(
    content: string,
    baseMessages: AiChatMessage[],
  ) {
    const hasNonWhitespace = content.trim().length > 0;

    if (!hasNonWhitespace) {
      setMessages([...baseMessages, { role: "assistant", content: "" }]);
      return;
    }

    const parts = content.match(/\s+|\S+/g);

    if (!parts) {
      setMessages([...baseMessages, { role: "assistant", content }]);
      return;
    }

    let current = "";

    for (let index = 0; index < parts.length; index += 1) {
      current += parts[index];

      setMessages([
        ...baseMessages,
        {
          role: "assistant",
          content: current,
        },
      ]);

      // Small delay for word-by-word effect
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }

  async function sendUserMessage(content: string) {
    const trimmed = content.trim();

    if (!trimmed) {
      return;
    }

    setError(null);

    const userMessage: AiChatMessage = {
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    onIsSendingChange(true);

    try {
      const assistantMessage = await aiChatRespond(nextMessages);
      const normalizedContent = normalizeMessageContent(
        assistantMessage.content,
      );
      const withAssistant = [
        ...nextMessages,
        { ...assistantMessage, content: normalizedContent },
      ];

      await streamAssistantMessage(normalizedContent, nextMessages);
      await updateSummary(withAssistant);
    } catch {
      setError(
        "Something went wrong while contacting Blairify AI. Please try again.",
      );
    } finally {
      onIsSendingChange(false);
    }
  }

  function handleTextareaKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key !== "Enter") {
      return;
    }

    if (event.shiftKey) {
      return;
    }

    if (event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();

    const form = event.currentTarget.form;

    if (!form) {
      return;
    }

    if (typeof form.requestSubmit === "function") {
      form.requestSubmit();
      return;
    }

    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  }

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSending) {
      return;
    }

    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    if (phase !== "conversation") {
      setPhase("conversation");
    }

    setInput("");
    await sendUserMessage(trimmed);
  }

  const sendMessageCallbackRef =
    useRef<(content: string) => Promise<void>>(sendUserMessage);
  sendMessageCallbackRef.current = sendUserMessage;

  useEffect(() => {
    if (!onSendMessageRef) {
      return;
    }

    const handler = async (content: string) =>
      sendMessageCallbackRef.current(content);

    onSendMessageRef.current = handler;

    return () => {
      if (onSendMessageRef.current === handler) {
        onSendMessageRef.current = null;
      }
    };
  }, [onSendMessageRef]);

  const messagesContainerClass =
    "flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 text-sm";

  switch (phase) {
    case "landing": {
      return (
        <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-background px-4 py-14">
          <div className="absolute inset-0 pointer-events-none" />
          <div className="relative w-full max-w-3xl space-y-6 text-center">
            <div className="space-y-3">
              <Typography.Heading1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow !text-primary">
                Let's build an interview
              </Typography.Heading1>
              <Typography.Body className="text-sm sm:text-base">
                Create structured interviews by chatting with Blairify AI.
              </Typography.Body>
            </div>
            <form onSubmit={handleSend} className="mx-auto w-full max-w-3xl">
              <label className="sr-only" htmlFor="ai-message-landing">
                Describe the interview you want to build
              </label>
              <div className="relative flex items-center gap-3 rounded-4xl border border-border/60 bg-card/95 px-5 py-3.5 shadow-2xl backdrop-blur">
                <Textarea
                  id="ai-message-landing"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder="Begin with a brief description of the role and requirements..."
                  rows={3}
                  className="flex-1 resize-none border-none shadow-none !bg-transparent pr-28 text-base focus-visible:ring-0"
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  className="absolute right-3 inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold"
                >
                  <ArrowUp className="size-4" />
                  <span>Build now</span>
                </Button>
              </div>
            </form>
          </div>
        </section>
      );
    }
    case "firstPrompt": {
      return (
        <section className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-xl space-y-4">
            <div className="space-y-1 text-center">
              <Typography.CaptionMedium className="block">
                Describe your interview
              </Typography.CaptionMedium>
              <Typography.SubCaption className="block text-muted-foreground">
                Share the role, seniority, tech stack, company type, and what
                you want to assess.
              </Typography.SubCaption>
            </div>
            <form onSubmit={handleSend} className="space-y-2">
              <label className="sr-only" htmlFor="ai-message-initial">
                Describe the interview you want to build
              </label>
              <div className="relative">
                <Textarea
                  id="ai-message-initial"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder="For example: Senior frontend engineer for a startup, React/TypeScript, 60 minutes..."
                  rows={4}
                  className="pr-12 resize-none"
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  className="absolute bottom-2.5 right-2.5 inline-flex h-9 items-center gap-1 rounded-full px-3 text-xs font-medium"
                >
                  <ArrowUp className="size-4" />
                  <span>Build now</span>
                </Button>
              </div>
            </form>
          </div>
        </section>
      );
    }
    case "conversation": {
      return (
        <section className="flex h-[calc(100vh-8rem)] supports-[height:100dvh]:h-[calc(100dvh-8rem)] w-full overflow-hidden">
          <div className="flex min-h-0 flex-1 min-w-0 flex-col pb-6 gap-4">
            {error ? (
              <Typography.SubCaption className="block text-destructive">
                {error}
              </Typography.SubCaption>
            ) : null}
            <div className={messagesContainerClass}>
              {messages.map((message, index) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={index}
                    className={
                      isUser ? "flex justify-end" : "flex justify-start"
                    }
                  >
                    <div
                      className={
                        isUser
                          ? "flex max-w-[80%] flex-row-reverse items-start gap-2"
                          : "flex max-w-[80%] items-start gap-2"
                      }
                    >
                      {!isUser ? (
                        <InterviewerAvatar
                          interviewer={interviewer}
                          size={28}
                        />
                      ) : null}
                      <div className="space-y-1">
                        <Typography.SubCaptionMedium className="block text-muted-foreground">
                          {isUser ? "You" : `${interviewer.name} · Blairify AI`}
                        </Typography.SubCaptionMedium>
                        <div
                          className={
                            isUser
                              ? "rounded-2xl bg-primary px-3 py-2 text-primary-foreground whitespace-pre-wrap break-words"
                              : "rounded-2xl bg-muted/60 px-3 py-2 text-foreground prose prose-invert prose-sm max-w-none leading-relaxed whitespace-pre-wrap break-words prose-headings:mt-2 prose-headings:mb-1.5 prose-p:my-2 prose-li:my-1.5 prose-ol:my-2 prose-ul:my-2 prose-strong:text-foreground"
                          }
                        >
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {(isSending || isSummarizing) && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{interviewer.name} is thinking</span>
                <div className="flex gap-1" aria-hidden="true">
                  <span className="size-1.5 rounded-full bg-muted-foreground/70 animate-bounce" />
                  <span className="size-1.5 rounded-full bg-muted-foreground/70 animate-bounce delay-100" />
                  <span className="size-1.5 rounded-full bg-muted-foreground/70 animate-bounce delay-200" />
                </div>
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-2">
              <label className="sr-only" htmlFor="ai-message">
                Message Blairify AI
              </label>
              <div className="relative">
                <Textarea
                  id="ai-message"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder="Describe what you want this interview to cover..."
                  rows={3}
                  className="pr-12 resize-none !bg-transparent focus-visible:ring-0"
                />
                <Button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  className="absolute bottom-2.5 right-2.5 inline-flex rounded-full"
                >
                  <ArrowUp className="size-4" />
                </Button>
              </div>
            </form>
          </div>
        </section>
      );
    }
    default: {
      const _never: never = phase;
      throw new Error(`Unhandled phase: ${_never}`);
    }
  }
}
