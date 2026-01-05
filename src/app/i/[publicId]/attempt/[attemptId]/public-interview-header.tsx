import Logo from "@/components/common/atoms/logo-blairify";
import { Typography } from "@/components/common/atoms/typography";

interface PublicInterviewHeaderProps {
  linkTitle: string;
  companyName?: string;
  currentQuestion: number;
  totalQuestions: number;
  isSaving: boolean;
}

export function PublicInterviewHeader({
  linkTitle,
  companyName,
  currentQuestion,
  totalQuestions,
  isSaving,
}: PublicInterviewHeaderProps) {
  const safeCurrent = Math.min(currentQuestion, totalQuestions);
  const progress =
    totalQuestions > 0 ? Math.round((safeCurrent / totalQuestions) * 100) : 0;

  return (
    <header className="space-y-3 text-center">
      <Logo variant="iconText" iconSize={24} />
      <Typography.Heading3 className="text-2xl font-semibold text-foreground sm:text-3xl">
        {linkTitle}
        {companyName ? (
          <Typography.Caption className="ml-2 font-normal text-muted-foreground">
            at {companyName}
          </Typography.Caption>
        ) : null}
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
