"use client";

import { ArrowUp } from "lucide-react";
import { useState } from "react";
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
  COMPANY_PROFILES,
  INTERVIEW_DURATIONS,
  POSITIONS,
  SENIORITY_LEVELS,
} from "./interview-config-constants";

type BuildInterviewPhase = "landing" | "firstPrompt" | "conversation";

type QuickPickField = "position" | "seniority" | "companyProfile" | "duration";

type QuickPickSelections = Record<QuickPickField, string | null>;

interface BuildInterviewAiChatProps {
  onSummary?: (summary: AiPositionSummary) => void;
}

export function BuildInterviewAiChat({ onSummary }: BuildInterviewAiChatProps) {
  const interviewer = INTERVIEWERS[0];

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: "assistant",
      content:
        "Tell me about the interview you want to build. For example: team context, role, seniority, tech stack, and what you want to assess.",
    },
  ]);
  const [input, setInput] = useState("");
  const [quickPickSelections, setQuickPickSelections] =
    useState<QuickPickSelections>({
      position: null,
      seniority: null,
      companyProfile: null,
      duration: null,
    });
  const [isSending, setIsSending] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AiPositionSummary | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAsideVisible, setIsAsideVisible] = useState(true);
  const [phase, setPhase] = useState<BuildInterviewPhase>("landing");

  async function updateSummary(currentMessages: AiChatMessage[]) {
    setError(null);
    setIsSummarizing(true);

    try {
      const result = await aiSummarizePosition(currentMessages);
      setSummary(result);
    } catch {
      setError("Unable to summarize position right now. Please try again.");
    } finally {
      setIsSummarizing(false);
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
    setIsSending(true);

    try {
      const assistantMessage = await aiChatRespond(nextMessages);
      const withAssistant = [...nextMessages, assistantMessage];

      await streamAssistantMessage(assistantMessage.content, nextMessages);
      await updateSummary(withAssistant);
    } catch {
      setError(
        "Something went wrong while contacting Blairify AI. Please try again.",
      );
    } finally {
      setIsSending(false);
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

  async function handleSuggestionClick(
    field: QuickPickField,
    value: string,
    label: string,
  ) {
    if (isSending || isSummarizing) {
      return;
    }

    setQuickPickSelections((previous) => ({
      ...previous,
      [field]: value,
    }));

    let content = "";

    switch (field) {
      case "position": {
        content = `Let's target the ${label} position.`;
        break;
      }
      case "seniority": {
        content = `The seniority level should be ${label}.`;
        break;
      }
      case "companyProfile": {
        content = `Use a ${label} company profile.`;
        break;
      }
      case "duration": {
        content = `Make the interview last ${label}.`;
        break;
      }
      default: {
        const _never: never = field;
        throw new Error(`Unhandled suggestion field: ${_never}`);
      }
    }

    await sendUserMessage(content);
  }

  function renderSuggestions() {
    const showPosition = true;
    const showSeniority = true;
    const showCompanyProfile = true;
    const showDuration = true;

    if (
      !showPosition &&
      !showSeniority &&
      !showCompanyProfile &&
      !showDuration
    ) {
      return null;
    }

    return (
      <div className="space-y-3 rounded-md border bg-muted/40 p-3">
        <p className="text-xs font-medium text-muted-foreground">Quick picks</p>
        {showPosition ? (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Role</p>
            <div className="flex flex-wrap gap-2">
              {POSITIONS.map((item) => {
                const isSelected = quickPickSelections.position === item.value;

                return (
                  <Button
                    key={item.value}
                    type="button"
                    variant={isSelected ? "secondary" : "outline"}
                    size="sm"
                    aria-pressed={isSelected}
                    onClick={() =>
                      handleSuggestionClick("position", item.value, item.label)
                    }
                    disabled={isSending || isSummarizing}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        ) : null}
        {showSeniority ? (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Seniority</p>
            <div className="flex flex-wrap gap-2">
              {SENIORITY_LEVELS.map((item) => {
                const isSelected = quickPickSelections.seniority === item.value;

                return (
                  <Button
                    key={item.value}
                    type="button"
                    variant={isSelected ? "secondary" : "outline"}
                    size="sm"
                    aria-pressed={isSelected}
                    onClick={() =>
                      handleSuggestionClick("seniority", item.value, item.label)
                    }
                    disabled={isSending || isSummarizing}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        ) : null}
        {showCompanyProfile ? (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Company profile</p>
            <div className="flex flex-wrap gap-2">
              {COMPANY_PROFILES.map((item) => {
                const isSelected =
                  quickPickSelections.companyProfile === item.value;

                return (
                  <Button
                    key={item.value}
                    type="button"
                    variant={isSelected ? "secondary" : "outline"}
                    size="sm"
                    aria-pressed={isSelected}
                    onClick={() =>
                      handleSuggestionClick(
                        "companyProfile",
                        item.value,
                        item.label,
                      )
                    }
                    disabled={isSending || isSummarizing}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        ) : null}
        {showDuration ? (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Duration</p>
            <div className="flex flex-wrap gap-2">
              {INTERVIEW_DURATIONS.map((item) => {
                const isSelected = quickPickSelections.duration === item.value;

                return (
                  <Button
                    key={item.value}
                    type="button"
                    variant={isSelected ? "secondary" : "outline"}
                    size="sm"
                    aria-pressed={isSelected}
                    onClick={() =>
                      handleSuggestionClick("duration", item.value, item.label)
                    }
                    disabled={isSending || isSummarizing}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  function renderFieldChip(label: string, done: boolean) {
    const baseClass =
      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]";
    const stateClass = done
      ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-500"
      : "border-border bg-muted/40 text-muted-foreground";

    return (
      <span className={`${baseClass} ${stateClass}`}>
        <span
          className={
            done
              ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
              : "h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
          }
        />
        <span>{label}</span>
      </span>
    );
  }

  function isMeaningfulText(value: string | null | undefined): value is string {
    if (!value) {
      return false;
    }

    const trimmed = value.trim();

    if (!trimmed) {
      return false;
    }

    return trimmed !== "unknown";
  }

  function isMeaningfulNotes(
    value: string | null | undefined,
  ): value is string {
    if (!isMeaningfulText(value)) {
      return false;
    }

    return value !== "No summary available.";
  }

  const messagesContainerClass =
    "flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 text-sm";

  const hasSummary = summary !== null;
  const positionDone = Boolean(summary && summary.position !== "unknown");
  const seniorityDone = Boolean(summary && summary.seniority !== "unknown");
  const companyDone = Boolean(summary && summary.companyProfile !== "unknown");
  const durationDone = Boolean(
    summary && summary.duration !== "unknown" && summary.duration.trim() !== "",
  );
  const stackDone = Boolean(
    summary && summary.stack !== "unknown" && summary.stack.trim() !== "",
  );
  const modeDone = Boolean(
    summary && isMeaningfulText(summary.mode) && summary.mode !== "regular",
  );
  const notesDone = Boolean(summary && isMeaningfulNotes(summary.notes));
  const capturedCount =
    Number(positionDone) +
    Number(seniorityDone) +
    Number(companyDone) +
    Number(durationDone) +
    Number(stackDone);
  const allFieldsDone =
    positionDone && seniorityDone && companyDone && durationDone && stackDone;
  const dataComplete = hasSummary && allFieldsDone;
  const canSummarize = dataComplete && !isSummarizing;

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
                  className="flex-1 resize-none border-none bg-transparent pr-28 text-base focus-visible:ring-0"
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  className="absolute right-3 inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold"
                >
                  <ArrowUp className="h-4 w-4" />
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
              <p className="text-sm font-medium">Describe your interview</p>
              <p className="text-xs text-muted-foreground">
                Share the role, seniority, tech stack, company type, and what
                you want to assess.
              </p>
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
                  <ArrowUp className="h-4 w-4" />
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
        <section className="flex h-[calc(100vh-8rem)] supports-[height:100dvh]:h-[calc(100dvh-8rem)] w-full overflow-hidden flex-col gap-6 md:flex-row">
          <div className="flex min-h-0 flex-1 min-w-0 flex-col pb-6">
            <div className="mb-2 hidden justify-end md:flex">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAsideVisible((previous) => !previous)}
                className="shadow-xs"
              >
                {isAsideVisible ? "Hide interview data" : "Show interview data"}
              </Button>
            </div>
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
                        <p className="text-xs font-medium text-muted-foreground">
                          {isUser ? "You" : `${interviewer.name} · Blairify AI`}
                        </p>
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
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-bounce delay-100" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-bounce delay-200" />
                </div>
              </div>
            )}

            <form onSubmit={handleSend} className="mt-3 space-y-2">
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
                  className="pr-12 resize-none"
                />
                <Button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  className="absolute bottom-2.5 right-2.5 inline-flex h-9 items-center gap-1 rounded-full px-3 text-xs font-medium"
                >
                  <ArrowUp className="h-4 w-4" />
                  <span>Build now</span>
                </Button>
              </div>
            </form>
            <div className="mt-3 flex justify-end md:hidden">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDrawerOpen(true)}
                className="shadow-xs"
              >
                Interview data
              </Button>
            </div>
          </div>

          <aside
            className={`fixed inset-y-4 right-4 z-30 w-80 max-w-[85vw] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl transition-transform duration-200 md:static md:inset-auto md:z-auto md:mt-0 md:w-80 md:shrink-0 lg:w-96 ${
              isDrawerOpen
                ? "translate-x-0"
                : "translate-x-full md:translate-x-0"
            } ${isAsideVisible ? "" : "md:hidden"}`}
            aria-label="Interview data drawer"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 md:hidden">
              <p className="text-sm font-medium text-foreground">
                Interview data
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsDrawerOpen(false)}
                className="text-muted-foreground"
              >
                Close
              </Button>
            </div>
            <div className="space-y-4 p-4">
              {renderSuggestions()}

              {error ? (
                <p className="text-xs text-destructive">{error}</p>
              ) : null}

              <div className="space-y-2 rounded-md border bg-muted/40 p-3 text-sm">
                <p className="font-medium">Interview data</p>
                {summary ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex flex-wrap gap-2">
                        {renderFieldChip("Role", positionDone)}
                        {renderFieldChip("Seniority", seniorityDone)}
                        {renderFieldChip("Company", companyDone)}
                        {renderFieldChip("Duration", durationDone)}
                        {renderFieldChip("Stack", stackDone)}
                      </div>
                    </div>
                    {positionDone ||
                    seniorityDone ||
                    companyDone ||
                    durationDone ||
                    stackDone ||
                    modeDone ||
                    notesDone ? (
                      <>
                        <dl className="mt-2 space-y-2 text-xs">
                          {positionDone ? (
                            <div className="flex items-start justify-between gap-3">
                              <dt className="text-muted-foreground">Role</dt>
                              <dd className="text-right">{summary.position}</dd>
                            </div>
                          ) : null}
                          {seniorityDone ? (
                            <div className="flex items-start justify-between gap-3">
                              <dt className="text-muted-foreground">
                                Seniority
                              </dt>
                              <dd className="text-right">
                                {summary.seniority}
                              </dd>
                            </div>
                          ) : null}
                          {companyDone ? (
                            <div className="flex items-start justify-between gap-3">
                              <dt className="text-muted-foreground">Company</dt>
                              <dd className="text-right">
                                {summary.companyProfile}
                              </dd>
                            </div>
                          ) : null}
                          {durationDone ? (
                            <div className="flex items-start justify-between gap-3">
                              <dt className="text-muted-foreground">
                                Duration
                              </dt>
                              <dd className="text-right">{summary.duration}</dd>
                            </div>
                          ) : null}
                          {stackDone ? (
                            <div className="flex items-start justify-between gap-3">
                              <dt className="text-muted-foreground">Stack</dt>
                              <dd className="text-right">{summary.stack}</dd>
                            </div>
                          ) : null}
                          {modeDone ? (
                            <div className="flex items-start justify-between gap-3">
                              <dt className="text-muted-foreground">Mode</dt>
                              <dd className="text-right">{summary.mode}</dd>
                            </div>
                          ) : null}
                        </dl>
                        {notesDone ? (
                          <div className="mt-2 space-y-1">
                            <p className="text-muted-foreground">Notes</p>
                            <p className="text-xs whitespace-pre-line">
                              {summary.notes}
                            </p>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Keep chatting to extract the key interview parameters.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Keep chatting to extract the key interview parameters.
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    disabled={!canSummarize}
                    onClick={() => {
                      if (!canSummarize || !summary) {
                        return;
                      }

                      if (onSummary) {
                        onSummary(summary);
                      }
                    }}
                  >
                    Summarize
                  </Button>
                  <span className="text-[10px] text-muted-foreground">
                    {canSummarize ? "Ready" : `${capturedCount}/5 captured`}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </section>
      );
    }
    default: {
      const _never: never = phase;
      throw new Error(`Unhandled phase: ${_never}`);
    }
  }
}
