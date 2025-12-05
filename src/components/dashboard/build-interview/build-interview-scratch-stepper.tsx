"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { BuildInterviewTypeOption } from "./build-interview-type-option";
import {
  COMPANY_PROFILES,
  CONFIGURE_STEPS,
  type ConfigStep,
  INTERVIEW_DURATIONS,
  POSITIONS,
  SENIORITY_LEVELS,
} from "./interview-config-constants";

type ScratchStep = "position" | "experience" | "company" | "duration";

interface ScratchState {
  position: string | null;
  seniority: string | null;
  companyProfile: string | null;
  duration: string | null;
}

const SCRATCH_STEPS: Array<ConfigStep & { id: ScratchStep }> =
  CONFIGURE_STEPS as Array<ConfigStep & { id: ScratchStep }>;

const POSITION_GROUP_NAME = "scratch-position";
const SENIORITY_GROUP_NAME = "scratch-seniority";
const COMPANY_GROUP_NAME = "scratch-company";
const DURATION_GROUP_NAME = "scratch-duration";

function getScratchStepIndex(step: ScratchStep): number {
  switch (step) {
    case "position":
      return 1;
    case "experience":
      return 2;
    case "company":
      return 3;
    case "duration":
      return 4;
    default: {
      const _never: never = step;
      throw new Error(`Unhandled scratch step: ${_never}`);
    }
  }
}

export function BuildInterviewScratchStepper() {
  const [step, setStep] = useState<ScratchStep>("position");
  const [state, setState] = useState<ScratchState>({
    position: null,
    seniority: null,
    companyProfile: null,
    duration: null,
  });

  const currentIndex = getScratchStepIndex(step);

  function handleNext() {
    switch (step) {
      case "position": {
        if (!state.position) return;
        setStep("experience");
        return;
      }
      case "experience": {
        if (!state.seniority) return;
        setStep("company");
        return;
      }
      case "company": {
        if (!state.companyProfile) return;
        setStep("duration");
        return;
      }
      case "duration": {
        return;
      }
      default: {
        const _never: never = step;
        throw new Error(`Unhandled scratch step on next: ${_never}`);
      }
    }
  }

  function handleBack() {
    switch (step) {
      case "position": {
        return;
      }
      case "experience": {
        setStep("position");
        return;
      }
      case "company": {
        setStep("experience");
        return;
      }
      case "duration": {
        setStep("company");
        return;
      }
      default: {
        const _never: never = step;
        throw new Error(`Unhandled scratch step on back: ${_never}`);
      }
    }
  }

  const canGoNext = (() => {
    switch (step) {
      case "position":
        return Boolean(state.position);
      case "experience":
        return Boolean(state.seniority);
      case "company":
        return Boolean(state.companyProfile);
      case "duration":
        return Boolean(state.duration);
      default: {
        const _never: never = step;
        throw new Error(`Unhandled scratch step in canGoNext: ${_never}`);
      }
    }
  })();

  function renderStepIndicator() {
    return (
      <ol
        className="flex flex-wrap items-center gap-3 text-xs"
        aria-label="Build from scratch steps"
      >
        {SCRATCH_STEPS.map((item, index) => {
          const isActive = item.id === step;
          const isCompleted = index < currentIndex - 1;

          return (
            <li key={item.id} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border ${isActive ? "border-primary bg-primary text-primary-foreground" : isCompleted ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"}`}
                aria-current={isActive ? "step" : undefined}
              >
                {index + 1}
              </span>
              <span
                className={isActive ? "font-medium" : "text-muted-foreground"}
              >
                {item.title}
              </span>
              {index < SCRATCH_STEPS.length - 1 ? (
                <span className="mx-2 h-px w-4 bg-border" aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>
    );
  }

  function renderPositionStep() {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          What kind of role is this interview for?
        </p>
        <div className="flex flex-row flex-wrap gap-3">
          {POSITIONS.map((position) => (
            <BuildInterviewTypeOption
              key={position.value}
              id={position.value}
              name={POSITION_GROUP_NAME}
              label={position.label}
              shrinkToContent
              selected={state.position === position.value}
              onSelect={() =>
                setState((prev) => ({ ...prev, position: position.value }))
              }
            />
          ))}
        </div>
      </div>
    );
  }

  function renderExperienceStep() {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          What seniority level should this interview target?
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SENIORITY_LEVELS.map((level) => (
            <BuildInterviewTypeOption
              key={level.value}
              id={level.value}
              name={SENIORITY_GROUP_NAME}
              label={level.label}
              description={level.description}
              selected={state.seniority === level.value}
              onSelect={() =>
                setState((prev) => ({ ...prev, seniority: level.value }))
              }
            />
          ))}
        </div>
      </div>
    );
  }

  function renderCompanyStep() {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          What kind of company is this interview for?
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {COMPANY_PROFILES.map((profile) => (
            <BuildInterviewTypeOption
              key={profile.value}
              id={profile.value}
              name={COMPANY_GROUP_NAME}
              label={profile.label}
              description={profile.description}
              selected={state.companyProfile === profile.value}
              onSelect={() =>
                setState((prev) => ({ ...prev, companyProfile: profile.value }))
              }
            />
          ))}
        </div>
      </div>
    );
  }

  function renderDurationStep() {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          How long should this interview take?
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {INTERVIEW_DURATIONS.map((duration) => (
            <BuildInterviewTypeOption
              key={duration.value}
              id={duration.value}
              name={DURATION_GROUP_NAME}
              label={duration.label}
              selected={state.duration === duration.value}
              onSelect={() =>
                setState((prev) => ({ ...prev, duration: duration.value }))
              }
            />
          ))}
        </div>
      </div>
    );
  }

  function renderCurrentStep() {
    switch (step) {
      case "position":
        return renderPositionStep();
      case "experience":
        return renderExperienceStep();
      case "company":
        return renderCompanyStep();
      case "duration":
        return renderDurationStep();
      default: {
        const _never: never = step;
        throw new Error(`Unhandled scratch step render: ${_never}`);
      }
    }
  }

  return (
    <section className="space-y-4 border-t pt-4">
      <header className="space-y-2">
        <h2 className="text-base font-semibold">Configure interview</h2>
        <p className="text-sm text-muted-foreground">
          Answer a few quick questions so Blairify can build the right
          interview.
        </p>
        {renderStepIndicator()}
      </header>

      {renderCurrentStep()}

      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          disabled={step === "position"}
        >
          Back
        </Button>
        <Button type="button" onClick={handleNext} disabled={!canGoNext}>
          {step === "duration" ? "Done" : "Next"}
        </Button>
      </div>
    </section>
  );
}
