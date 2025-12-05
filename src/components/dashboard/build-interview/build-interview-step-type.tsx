import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { InterviewPersonalization } from "./build-interview-flow";
import { BuildInterviewTypeOption } from "./build-interview-type-option";

interface BuildInterviewStepTypeProps {
  value: InterviewPersonalization | null;
  onChange: (value: InterviewPersonalization) => void;
  candidateName: string;
  candidateRole: string;
  onCandidateNameChange: (value: string) => void;
  onCandidateRoleChange: (value: string) => void;
}

export function BuildInterviewStepType({
  value,
  onChange,
  candidateName,
  candidateRole,
  onCandidateNameChange,
  onCandidateRoleChange,
}: BuildInterviewStepTypeProps) {
  const groupName = "interview-type";

  return (
    <fieldset className="space-y-4">
      <legend className="text-base font-medium">
        Choose your interview type
      </legend>
      <p className="text-sm text-muted-foreground">
        Decide if this interview should be tailored to a specific context or
        reusable across many roles.
      </p>
      <div className="flex flex-row flex-wrap gap-3">
        <BuildInterviewTypeOption
          id="personalized"
          name={groupName}
          label="Personalized"
          description="Tailored to a specific role, team, or candidate profile."
          selected={value === "personalized"}
          onSelect={() => onChange("personalized")}
        />

        <BuildInterviewTypeOption
          id="general"
          name={groupName}
          label="General"
          description="A reusable interview that works across multiple roles."
          selected={value === "general"}
          onSelect={() => onChange("general")}
        />
      </div>

      {value === "personalized" ? (
        <div className="grid gap-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="candidate-name">Candidate name</Label>
            <Input
              id="candidate-name"
              value={candidateName}
              onChange={(event) => onCandidateNameChange(event.target.value)}
              placeholder="e.g. Alex Smith"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="candidate-role">Role for this candidate</Label>
            <Input
              id="candidate-role"
              value={candidateRole}
              onChange={(event) => onCandidateRoleChange(event.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>
        </div>
      ) : null}
    </fieldset>
  );
}
