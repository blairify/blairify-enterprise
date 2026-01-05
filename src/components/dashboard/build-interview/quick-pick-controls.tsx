"use client";

import { Wand2 } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  INTERVIEW_DURATIONS,
  POSITIONS,
  SENIORITY_LEVELS,
} from "./interview-config-constants";
import type { QuickPickField, QuickPickSelections } from "./quick-pick-types";

interface QuickPickControlsProps {
  selections: QuickPickSelections;
  onSelect: (field: QuickPickField, value: string, label: string) => void;
  disabled?: boolean;
}

function quickPickButtonClasses(isSelected: boolean): string {
  return cn(
    "border text-xs font-medium transition-colors",
    isSelected
      ? "border-emerald-500 bg-emerald-500/20 text-emerald-500"
      : "border-border/70 text-muted-foreground hover:text-foreground",
  );
}

export function QuickPickControls({
  selections,
  onSelect,
  disabled = false,
}: QuickPickControlsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Wand2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <Typography.Body className="text-xs font-medium">
          Quick picks
        </Typography.Body>
      </div>

      <div className="space-y-1">
        <Typography.Body className="text-xs text-muted-foreground">
          Role
        </Typography.Body>
        <div className="flex flex-wrap gap-1.5">
          {POSITIONS.map((item) => {
            const isSelected = selections.position === item.value;
            return (
              <Button
                key={item.value}
                type="button"
                variant="outline"
                size="sm"
                aria-pressed={isSelected}
                className={quickPickButtonClasses(isSelected)}
                onClick={() => onSelect("position", item.value, item.label)}
                disabled={disabled}
              >
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="space-y-1">
        <Typography.Body className="text-xs text-muted-foreground">
          Seniority
        </Typography.Body>
        <div className="flex flex-wrap gap-1.5">
          {SENIORITY_LEVELS.map((item) => {
            const isSelected = selections.seniority === item.value;
            return (
              <Button
                key={item.value}
                type="button"
                variant="outline"
                size="sm"
                aria-pressed={isSelected}
                className={quickPickButtonClasses(isSelected)}
                onClick={() => onSelect("seniority", item.value, item.label)}
                disabled={disabled}
              >
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="space-y-1">
        <Typography.Body className="text-xs text-muted-foreground">
          Duration
        </Typography.Body>
        <div className="flex flex-wrap gap-1.5">
          {INTERVIEW_DURATIONS.map((item) => {
            const isSelected = selections.duration === item.value;
            return (
              <Button
                key={item.value}
                type="button"
                variant="outline"
                size="sm"
                aria-pressed={isSelected}
                className={quickPickButtonClasses(isSelected)}
                onClick={() => onSelect("duration", item.value, item.label)}
                disabled={disabled}
              >
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
