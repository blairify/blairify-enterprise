import type { AiPositionSummary } from "@/app/dashboard/build-interview/actions";

export type SeniorityLevel = "entry" | "junior" | "mid" | "senior";

export type PlannedQuestionSource = "practice" | "ai";

export interface PlannedQuestion {
  id: string;
  source: PlannedQuestionSource;
  prompt: string;
  title?: string;
  description?: string;
  meta?: {
    topic?: string;
    difficulty?: string;
    techStack?: string[];
  };
}

export interface TestInterviewConfig {
  position: string;
  seniority: SeniorityLevel;
  companyProfile: string;
  durationMinutes: number;
  stack: string;
  notes: string;
}

export function parseSeniority(value: string): SeniorityLevel | null {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes("entry")) return "entry";
  if (normalized.includes("junior")) return "junior";
  if (normalized.includes("mid")) return "mid";
  if (normalized.includes("senior")) return "senior";

  switch (normalized) {
    case "entry":
      return "entry";
    case "junior":
      return "junior";
    case "mid":
    case "mid-level":
    case "midlevel":
      return "mid";
    case "senior":
      return "senior";
    default:
      return null;
  }
}

export function parseDurationMinutes(value: string): number | null {
  const match = value.match(/\d+(?:\.\d+)?/);

  if (!match) {
    return null;
  }

  const asNumber = Number(match[0]);

  if (!Number.isFinite(asNumber) || asNumber <= 0) {
    return null;
  }

  return asNumber;
}

export function configFromSummary(
  summary: AiPositionSummary,
): TestInterviewConfig | null {
  const seniority = parseSeniority(summary.seniority);
  const durationMinutes = parseDurationMinutes(summary.duration);

  if (!seniority || !durationMinutes) {
    return null;
  }

  return {
    position: summary.position,
    seniority,
    companyProfile: summary.companyProfile,
    durationMinutes,
    stack: summary.stack,
    notes: summary.notes,
  };
}

export function totalQuestionCountFromDuration(
  durationMinutes: number,
): number {
  if (durationMinutes <= 15) return 3;
  if (durationMinutes <= 30) return 6;
  if (durationMinutes <= 45) return 8;
  if (durationMinutes <= 60) return 10;
  if (durationMinutes <= 75) return 12;
  return 14;
}

export function practiceQuestionCount(total: number): number {
  if (total <= 0) return 0;
  if (total <= 2) return total;

  return Math.min(total, Math.max(2, Math.floor(total / 2)));
}
