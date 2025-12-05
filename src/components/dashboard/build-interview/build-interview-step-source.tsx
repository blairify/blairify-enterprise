import type { InterviewSource } from "./build-interview-flow";
import { BuildInterviewTypeOption } from "./build-interview-type-option";

interface BuildInterviewStepSourceProps {
  value: InterviewSource | null;
  onChange: (value: InterviewSource) => void;
}

export function BuildInterviewStepSource({
  value,
  onChange,
}: BuildInterviewStepSourceProps) {
  const groupName = "interview-source";

  return (
    <fieldset className="space-y-4">
      <legend className="text-base font-medium">
        How do you want to start?
      </legend>
      <p className="text-sm text-muted-foreground">
        Start from a blank canvas, a job listing, or let Blairify design the
        interview for you.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <BuildInterviewTypeOption
          id="source-scratch"
          name={groupName}
          label="Build from scratch"
          description="Start with a clean slate and define the structure yourself."
          selected={value === "scratch"}
          onSelect={() => onChange("scratch")}
        />

        <BuildInterviewTypeOption
          id="source-job"
          name={groupName}
          label="Build from a job listing"
          description="Use an existing job description as the foundation for this interview."
          selected={value === "job_listing"}
          onSelect={() => onChange("job_listing")}
        />

        <BuildInterviewTypeOption
          id="source-ai"
          name={groupName}
          label="Build with AI"
          description="Let Blairify propose an interview structure based on your preferences."
          selected={value === "ai"}
          onSelect={() => onChange("ai")}
        />
      </div>
    </fieldset>
  );
}
