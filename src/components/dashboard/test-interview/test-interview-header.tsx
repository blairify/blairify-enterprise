import { Trophy } from "lucide-react";

import type { AiPositionSummary } from "@/app/dashboard/build-interview/actions";
import { InterviewerAvatar } from "@/components/common/atoms/interviewer-avatar";
import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";
import type { InterviewerProfile } from "@/lib/config/interviewers";

interface TestInterviewHeaderProps {
  interviewer: InterviewerProfile;
  summary: AiPositionSummary;
  currentQuestion: number;
  totalQuestions: number;
  isSending: boolean;
}

export function TestInterviewHeader({
  interviewer,
  summary,
  currentQuestion,
  totalQuestions,
  isSending,
}: TestInterviewHeaderProps) {
  const progress =
    totalQuestions > 0
      ? Math.round((currentQuestion / totalQuestions) * 100)
      : 0;

  return (
    <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-background/80 via-background/90 to-background p-6 shadow-xl ring-1 ring-border/40">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl border border-border/60 bg-background/80 p-2">
            <div className="h-full w-full rounded-xl bg-muted/40 flex items-center justify-center">
              <InterviewerAvatar interviewer={interviewer} size={48} />
            </div>
          </div>
          <div className="space-y-1">
            <Typography.SubCaption className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Interviewer
            </Typography.SubCaption>
            <Typography.Heading3 className="text-xl font-semibold">
              {interviewer.name}
            </Typography.Heading3>
            <Typography.SubCaption className="text-xs text-muted-foreground">
              {interviewer.title}
            </Typography.SubCaption>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
            <Typography.SubCaption className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Position
            </Typography.SubCaption>
            <Typography.Body className="font-semibold capitalize">
              {summary.position}
            </Typography.Body>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
            <Typography.SubCaption className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Seniority
            </Typography.SubCaption>
            <Badge variant="secondary" className="mt-1 capitalize">
              {summary.seniority}
            </Badge>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
            <Typography.SubCaption className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Mode
            </Typography.SubCaption>
            <Typography.Body className="font-semibold capitalize">
              {summary.mode ?? "regular"}
            </Typography.Body>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            Question {Math.min(currentQuestion, totalQuestions)} /{" "}
            {totalQuestions || "—"}
          </span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />
        </div>
        {isSending ? (
          <div className="flex items-center gap-2 text-xs text-primary">
            <Trophy className="size-3.5 animate-pulse" />
            Evaluating your answer…
          </div>
        ) : null}
      </div>
    </div>
  );
}
