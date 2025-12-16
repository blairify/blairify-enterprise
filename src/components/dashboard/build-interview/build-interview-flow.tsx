"use client";

import { BuildInterviewAiChat } from "./build-interview-ai-chat";

export type InterviewPersonalization = "personalized" | "general";
export type InterviewSource = "scratch" | "job_listing" | "ai";
export type BuildInterviewStep = "type" | "source";

export function BuildInterviewFlow() {
  return (
    <div className="bg-background flex items-stretch justify-center">
      <div className="w-full max-w-6xl">
        <BuildInterviewAiChat />
      </div>
    </div>
  );
}
