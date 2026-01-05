"use client";

import { motion } from "motion/react";
import type { AiPositionSummary } from "@/app/dashboard/build-interview/actions";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuickPickControls } from "./quick-pick-controls";
import type { QuickPickField, QuickPickSelections } from "./quick-pick-types";

interface TestInterviewPlanPanelProps {
  summary: AiPositionSummary;
  isGenerating: boolean;
  error: string | null;
  canStart: boolean;
  onGenerate: () => void;
  quickPickSelections: QuickPickSelections;
  onQuickPickSelect: (
    field: QuickPickField,
    value: string,
    label: string,
  ) => void;
  isSending: boolean;
  isSummarizing: boolean;
}

export function TestInterviewPlanPanel({
  summary,
  isGenerating,
  error,
  canStart,
  onGenerate,
  quickPickSelections,
  onQuickPickSelect,
  isSending,
  isSummarizing,
}: TestInterviewPlanPanelProps) {
  const isDisabled = isSending || isSummarizing;
  const companyValue = summary.companyProfile?.trim();
  const stackValueRaw = summary.stack?.trim();
  const hasCompany = companyValue && companyValue !== "unknown";
  const hasStack = stackValueRaw && stackValueRaw !== "unknown";

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="h-full overflow-y-auto"
      >
        <Card className="shadow-xl shadow-primary/5 sticky top-0">
          <CardContent className="space-y-4">
            <QuickPickControls
              selections={quickPickSelections}
              onSelect={onQuickPickSelect}
              disabled={isDisabled}
            />
            <div className="grid gap-3 text-sm">
              <div className="space-y-1">
                <Typography.Body className="text-xs text-muted-foreground">
                  Company name
                </Typography.Body>
                {hasCompany ? (
                  <span className="inline-block rounded-md border border-emerald-500 bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-500">
                    {companyValue}
                  </span>
                ) : (
                  <span className="inline-block rounded-md border border-dashed border-border/50 bg-muted/10 px-2.5 py-1 text-xs italic text-muted-foreground">
                    Not provided yet
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <Typography.Body className="text-xs text-muted-foreground">
                  Stack
                </Typography.Body>
                {hasStack ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-block max-w-full truncate rounded-md border border-emerald-500 bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-500">
                        {stackValueRaw}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="left"
                      align="center"
                      className="max-w-xs whitespace-pre-wrap break-words"
                    >
                      <Typography.SubCaption className="text-xs">
                        {stackValueRaw}
                      </Typography.SubCaption>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="inline-block rounded-md border border-dashed border-border/50 bg-muted/10 px-2.5 py-1 text-xs italic text-muted-foreground">
                    Not provided yet
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-row items-center justify-start gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onGenerate}
                disabled={isGenerating && !canStart}
              >
                {isGenerating ? "Generating..." : "Generate questions"}
              </Button>
            </div>

            {error ? (
              <Typography.Body className="text-xs text-destructive">
                {error}
              </Typography.Body>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}
