import type { BuildInterviewStep } from "./build-interview-flow";

const STEPS: BuildInterviewStep[] = ["type", "source"];

function getStepLabel(step: BuildInterviewStep): string {
  switch (step) {
    case "type":
      return "Interview type";
    case "source":
      return "Source";
    default: {
      const _never: never = step;
      throw new Error(`Unhandled build interview step label: ${_never}`);
    }
  }
}

interface BuildInterviewStepHeaderProps {
  currentStep: BuildInterviewStep;
}

export function BuildInterviewStepHeader({
  currentStep,
}: BuildInterviewStepHeaderProps) {
  return (
    <ol
      className="flex items-center gap-4 text-sm"
      aria-label="Build interview steps"
    >
      {STEPS.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = index < STEPS.indexOf(currentStep);

        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${isActive ? "border-primary bg-primary text-primary-foreground" : isCompleted ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"}`}
              aria-current={isActive ? "step" : undefined}
            >
              {index + 1}
            </span>
            <span
              className={isActive ? "font-medium" : "text-muted-foreground"}
            >
              {getStepLabel(step)}
            </span>
            {index < STEPS.length - 1 ? (
              <span className="mx-2 h-px w-8 bg-border" aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
