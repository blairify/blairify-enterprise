"use client";

import { Maximize2, Minimize2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { INTERVIEWERS } from "@/lib/config/interviewers";

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
  const [isSending, setIsSending] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AiPositionSummary | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = input.trim();

    if (!trimmed) {
      return;
    }

    setError(null);

    const userMessage: AiChatMessage = {
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const assistantMessage = await aiChatRespond([...messages, userMessage]);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setError(
        "Something went wrong while contacting Blairify AI. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  }

  async function handleSummarize() {
    setError(null);
    setIsSummarizing(true);

    try {
      const result = await aiSummarizePosition(messages);
      setSummary(result);
      if (onSummary) {
        onSummary(result);
      }
    } catch {
      setError("Unable to summarize position right now. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  }

  const messagesContainerClass = isExpanded
    ? "border rounded-md max-h-[60vh] overflow-y-auto p-3 space-y-3 text-sm bg-card"
    : "border rounded-md max-h-80 overflow-y-auto p-3 space-y-3 text-sm bg-card";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <InterviewerAvatar interviewer={interviewer} size={40} />
          <div className="flex flex-col">
            <CardTitle className="text-base">Build with AI</CardTitle>
            <p className="text-xs text-muted-foreground">
              {interviewer.name} helps you turn your role context into a
              structured interview.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-label={isExpanded ? "Collapse AI chat" : "Expand AI chat"}
        >
          {isExpanded ? (
            <Minimize2 className="h-3 w-3" />
          ) : (
            <Maximize2 className="h-3 w-3" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={messagesContainerClass}>
          {messages.map((message, index) => {
            const isUser = message.role === "user";

            return (
              <div
                key={index}
                className={isUser ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    isUser
                      ? "flex max-w-[80%] flex-row-reverse items-start gap-2"
                      : "flex max-w-[80%] items-start gap-2"
                  }
                >
                  {!isUser ? (
                    <InterviewerAvatar interviewer={interviewer} size={28} />
                  ) : null}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {isUser ? "You" : `${interviewer.name} · Blairify AI`}
                    </p>
                    <div
                      className={`rounded-2xl px-3 py-2 whitespace-pre-wrap break-words ${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/60 text-foreground"
                      }`}
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
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{interviewer.name} is thinking</span>
            <div className="flex gap-1" aria-hidden="true">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-bounce delay-100" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-bounce delay-200" />
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-2">
          <label className="sr-only" htmlFor="ai-message">
            Message Blairify AI
          </label>
          <Textarea
            id="ai-message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Describe what you want this interview to cover..."
            rows={3}
          />
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSummarize}
              disabled={isSummarizing || messages.length === 0}
            >
              {isSummarizing ? "Summarizing..." : "Summarize position"}
            </Button>
            <Button type="submit" disabled={isSending || !input.trim()}>
              {isSending ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>

        {error ? <p className="text-xs text-destructive">{error}</p> : null}

        {summary ? (
          <div className="space-y-2 border-t pt-3 text-sm">
            <p className="font-medium">Position summary</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div>
                <dt className="text-muted-foreground">Position</dt>
                <dd>{summary.position}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Seniority</dt>
                <dd>{summary.seniority}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Company profile</dt>
                <dd>{summary.companyProfile}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Mode</dt>
                <dd>{summary.mode}</dd>
              </div>
            </dl>
            <div className="space-y-1">
              <p className="text-muted-foreground">Notes</p>
              <p className="text-xs whitespace-pre-line">{summary.notes}</p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
