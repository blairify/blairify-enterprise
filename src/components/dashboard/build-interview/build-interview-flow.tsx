"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BuildInterviewAiChat } from "./build-interview-ai-chat";
import { BuildInterviewJobListingChat } from "./build-interview-job-listing-chat";
import { BuildInterviewScratchStepper } from "./build-interview-scratch-stepper";
import { BuildInterviewStepHeader } from "./build-interview-step-header";
import { BuildInterviewStepSource } from "./build-interview-step-source";
import { BuildInterviewStepType } from "./build-interview-step-type";

export type InterviewPersonalization = "personalized" | "general";
export type InterviewSource = "scratch" | "job_listing" | "ai";
export type BuildInterviewStep = "type" | "source";

interface BuildInterviewState {
  step: BuildInterviewStep;
  personalization: InterviewPersonalization | null;
  source: InterviewSource | null;
  candidateName: string;
  candidateRole: string;
}

export function BuildInterviewFlow() {
  const [state, setState] = useState<BuildInterviewState>({
    step: "type",
    personalization: null,
    source: null,
    candidateName: "",
    candidateRole: "",
  });

  function handleNext() {
    switch (state.step) {
      case "type": {
        if (state.personalization === null) {
          return;
        }

        if (state.personalization === "personalized") {
          const name = state.candidateName.trim();
          const role = state.candidateRole.trim();

          if (!name || !role) {
            return;
          }
        }

        setState((prev) => ({ ...prev, step: "source" }));
        return;
      }
      case "source": {
        return;
      }
      default: {
        const _never: never = state.step;
        throw new Error(`Unhandled build interview step on next: ${_never}`);
      }
    }
  }

  function handleBack() {
    switch (state.step) {
      case "type": {
        return;
      }
      case "source": {
        setState((prev) => ({ ...prev, step: "type" }));
        return;
      }
      default: {
        const _never: never = state.step;
        throw new Error(`Unhandled build interview step on back: ${_never}`);
      }
    }
  }

  const canGoNext = (() => {
    switch (state.step) {
      case "type": {
        if (state.personalization === null) {
          return false;
        }

        if (state.personalization === "general") {
          return true;
        }

        if (state.personalization === "personalized") {
          const name = state.candidateName.trim();
          const role = state.candidateRole.trim();

          return Boolean(name && role);
        }

        const _never: never = state.personalization;
        throw new Error(`Unhandled personalization in canGoNext: ${_never}`);
      }
      case "source": {
        return state.source !== null;
      }
      default: {
        const _never: never = state.step;
        throw new Error(
          `Unhandled build interview step for canGoNext: ${_never}`,
        );
      }
    }
  })();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Build interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <BuildInterviewStepHeader currentStep={state.step} />

          {(() => {
            switch (state.step) {
              case "type": {
                return (
                  <BuildInterviewStepType
                    value={state.personalization}
                    onChange={(value: InterviewPersonalization) =>
                      setState((prev) => ({ ...prev, personalization: value }))
                    }
                    candidateName={state.candidateName}
                    candidateRole={state.candidateRole}
                    onCandidateNameChange={(candidateName: string) =>
                      setState((prev) => ({ ...prev, candidateName }))
                    }
                    onCandidateRoleChange={(candidateRole: string) =>
                      setState((prev) => ({ ...prev, candidateRole }))
                    }
                  />
                );
              }
              case "source": {
                return (
                  <div className="space-y-6">
                    <BuildInterviewStepSource
                      value={state.source}
                      onChange={(value: InterviewSource) =>
                        setState((prev) => ({ ...prev, source: value }))
                      }
                    />
                    {state.source === "scratch" ? (
                      <BuildInterviewScratchStepper />
                    ) : null}
                    {state.source === "job_listing" ? (
                      <BuildInterviewJobListingChat />
                    ) : null}
                    {state.source === "ai" ? <BuildInterviewAiChat /> : null}
                  </div>
                );
              }
              default: {
                const _never: never = state.step;
                throw new Error(
                  `Unhandled build interview step render: ${_never}`,
                );
              }
            }
          })()}

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={state.step === "type"}
            >
              Back
            </Button>
            <Button type="button" onClick={handleNext} disabled={!canGoNext}>
              {state.step === "source" ? "Continue" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
