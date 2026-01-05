"use client";

import { Sparkles, User } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

import { InterviewerAvatar } from "@/components/common/atoms/interviewer-avatar";
import { Typography } from "@/components/common/atoms/typography";
import { getInterviewerById, INTERVIEWERS } from "@/lib/config/interviewers";

interface Message {
  id: string;
  role: "ai" | "user";
  title?: string;
  content: string;
}

interface PublicInterviewMessagesProps {
  messages: Message[];
  isSaving: boolean;
  interviewerId?: string;
}

function TypewriterText({
  text,
  speed = 20,
}: {
  text: string;
  speed?: number;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    let index = 0;
    const words = text.split(" ");

    const interval = setInterval(() => {
      if (index < words.length) {
        setDisplayedText(words.slice(0, index + 1).join(" "));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      {!isComplete && <span className="animate-pulse">▊</span>}
    </span>
  );
}

export function PublicInterviewMessages({
  messages,
  isSaving,
  interviewerId,
}: PublicInterviewMessagesProps) {
  const isEmpty = messages.length === 0;
  const interviewer = interviewerId
    ? getInterviewerById(interviewerId)
    : INTERVIEWERS[0];

  return (
    <div className="flex flex-col">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-6">
            <Sparkles className="size-9 text-primary" />
          </div>
          <Typography.Heading2 className="text-xl font-semibold text-center">
            Ready to begin?
          </Typography.Heading2>
          <Typography.Caption className="mt-3 text-center text-muted-foreground max-w-sm">
            Your AI interviewer is ready. Take your time and answer each
            question thoughtfully. Good luck!
          </Typography.Caption>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {messages.map((message, index) => {
            const isLastAiMessage =
              message.role === "ai" &&
              index === messages.length - 1 &&
              !messages.some((m, i) => i > index && m.role === "ai");

            return (
              <Fragment key={message.id}>
                <div
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {message.role === "ai" && interviewer ? (
                      <div className="flex-shrink-0">
                        <InterviewerAvatar
                          interviewer={interviewer}
                          size={36}
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                        <User className="size-4" />
                      </div>
                    )}
                    <div
                      className={`space-y-1 ${message.role === "user" ? "text-right" : "text-left"}`}
                    >
                      <Typography.SubCaption
                        className={
                          message.role === "ai"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      >
                        {message.role === "ai" && interviewer
                          ? interviewer.name
                          : message.role === "ai"
                            ? "Interviewer"
                            : "You"}
                      </Typography.SubCaption>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.role === "ai"
                            ? "bg-muted/50 text-foreground rounded-tl-sm"
                            : "bg-primary text-primary-foreground rounded-tr-sm"
                        }`}
                      >
                        {message.title && message.role === "ai" ? (
                          <Typography.SubCaption className="block mb-1 text-muted-foreground">
                            {message.title}
                          </Typography.SubCaption>
                        ) : null}
                        <Typography.Body className="whitespace-pre-wrap text-sm leading-relaxed">
                          {isLastAiMessage ? (
                            <TypewriterText text={message.content} speed={60} />
                          ) : (
                            message.content
                          )}
                        </Typography.Body>
                      </div>
                    </div>
                  </div>
                </div>
              </Fragment>
            );
          })}
          {isSaving ? (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                {interviewer ? (
                  <div className="flex-shrink-0">
                    <InterviewerAvatar interviewer={interviewer} size={36} />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-primary text-primary-foreground" />
                )}
                <div className="space-y-1">
                  <Typography.SubCaption className="text-primary">
                    {interviewer?.name ?? "Interviewer"}
                  </Typography.SubCaption>
                  <div className="rounded-2xl rounded-tl-sm bg-muted/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                      </div>
                      <Typography.Caption className="text-muted-foreground">
                        Thinking...
                      </Typography.Caption>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
