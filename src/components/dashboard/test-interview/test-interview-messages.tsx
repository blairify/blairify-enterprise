import { Sparkles } from "lucide-react";

import { InterviewerAvatar } from "@/components/common/atoms/interviewer-avatar";
import { Typography } from "@/components/common/atoms/typography";
import type { InterviewerProfile } from "@/lib/config/interviewers";

type ChatRole = "assistant" | "user";

export interface TestInterviewMessage {
  id: string;
  role: ChatRole;
  content: string;
}

interface TestInterviewMessagesProps {
  messages: TestInterviewMessage[];
  interviewer: InterviewerProfile;
  isSending: boolean;
}

export function TestInterviewMessages({
  messages,
  interviewer,
  isSending,
}: TestInterviewMessagesProps) {
  const isEmpty = messages.length === 0;

  if (isEmpty) {
    return (
      <div className="rounded-3xl border border-dashed border-border/60 bg-muted/30 px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="size-8 text-primary" />
        </div>
        <Typography.Heading3 className="text-xl font-semibold">
          Ready to start your training interview?
        </Typography.Heading3>
        <Typography.Body className="mt-2 text-sm text-muted-foreground">
          {interviewer.name} is on standby. Share your approach just like a live
          session.
        </Typography.Body>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isUser = message.role === "user";
        const alignment = isUser ? "justify-end" : "justify-start";
        const bubble = isUser
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground border border-border/40";

        return (
          <div key={message.id} className={`flex ${alignment}`}>
            <div className="max-w-2xl space-y-1">
              {!isUser ? (
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="size-5 rounded-full border border-border/50">
                    <InterviewerAvatar interviewer={interviewer} size={20} />
                  </span>
                  <span className="font-medium">{interviewer.name}</span>
                </div>
              ) : null}
              <div
                className={`rounded-3xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${bubble}`}
              >
                {message.content}
              </div>
            </div>
          </div>
        );
      })}

      {isSending ? (
        <div className="flex justify-start">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Evaluating your answer…
          </div>
        </div>
      ) : null}
    </div>
  );
}
