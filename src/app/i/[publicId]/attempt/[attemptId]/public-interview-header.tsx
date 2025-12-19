import { Typography } from "@/components/common/atoms/typography";

interface PublicInterviewHeaderProps {
  linkTitle: string;
  currentQuestion: number;
  totalQuestions: number;
  isSaving: boolean;
}

export function PublicInterviewHeader({
  linkTitle,
  currentQuestion,
  totalQuestions,
  isSaving,
}: PublicInterviewHeaderProps) {
  const safeCurrent = Math.min(currentQuestion, totalQuestions);
  const progress =
    totalQuestions > 0 ? Math.round((safeCurrent / totalQuestions) * 100) : 0;

  return (
    <header className="space-y-3 text-center">
      <Typography.SubCaption className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Blairify Interview
      </Typography.SubCaption>
      <Typography.Heading3 className="text-2xl font-semibold text-foreground sm:text-3xl">
        {linkTitle}
      </Typography.Heading3>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            Question {Math.max(1, safeCurrent)} / {totalQuestions || "—"}
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
        {isSaving ? (
          <Typography.SubCaption className="text-xs text-primary">
            Submitting interview…
          </Typography.SubCaption>
        ) : null}
      </div>
    </header>
  );
}
