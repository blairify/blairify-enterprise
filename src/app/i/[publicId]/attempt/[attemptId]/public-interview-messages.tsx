import { Sparkles } from "lucide-react";
import { Fragment } from "react";

import { Typography } from "@/components/common/atoms/typography";

interface Message {
  id: string;
  role: "ai" | "user";
  title?: string;
  content: string;
}

interface PublicInterviewMessagesProps {
  linkTitle: string;
  messages: Message[];
  isSaving: boolean;
}

export function PublicInterviewMessages({
  linkTitle,
  messages,
  isSaving,
}: PublicInterviewMessagesProps) {
  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {isEmpty ? (
        <div className="text-center py-16 px-6 rounded-3xl border border-dashed border-muted bg-muted/30">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="size-7 text-primary" />
          </div>
          <Typography.Heading3 className="text-lg font-semibold">
            Ready to begin {linkTitle}?
          </Typography.Heading3>
          <Typography.Body className="mt-2 text-sm text-muted-foreground">
            Your AI interviewer is standing by. Take your time and answer
            thoughtfully.
          </Typography.Body>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Fragment key={message.id}>
              <div
                className={`flex ${message.role === "ai" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-xl rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === "ai"
                      ? "bg-muted text-foreground border border-border/50"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.title ? (
                    <Typography.SubCaption className="text-xs uppercase tracking-[0.2em] block mb-2 opacity-80">
                      {message.title}
                    </Typography.SubCaption>
                  ) : null}
                  <Typography.Body className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </Typography.Body>
                </div>
              </div>
            </Fragment>
          ))}
          {isSaving ? (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 rounded-full bg-muted/50">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                Submitting…
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
