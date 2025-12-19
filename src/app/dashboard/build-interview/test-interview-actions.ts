"use server";

import { Mistral } from "@mistralai/mistralai";
import { z } from "zod";
import {
  getInterviewerById,
  getInterviewerForRole,
} from "@/lib/config/interviewers";
import { queryQuestions } from "@/lib/practice-library/question-repository";
import {
  configFromSummary,
  type PlannedQuestion,
  practiceQuestionCount,
  type SeniorityLevel,
  totalQuestionCountFromDuration,
} from "@/lib/test-interview/test-interview-types";
import type { DifficultyLevel, Question } from "@/types/practice-question";
import type { AiPositionSummary } from "./actions";

const aiQuestionsSchema = z.object({ questions: z.array(z.string()) });

type MistralContentChunk =
  | {
      text?: string;
    }
  | string;

function readMistralContent(rawContent: unknown): string {
  if (Array.isArray(rawContent)) {
    return (rawContent as MistralContentChunk[])
      .map((chunk) => (typeof chunk === "string" ? chunk : (chunk.text ?? "")))
      .join("");
  }

  if (typeof rawContent === "string") {
    return rawContent;
  }

  return "";
}

function getMistralClient(): Mistral {
  const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;

  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is not configured");
  }

  return new Mistral({ apiKey });
}

function mapSeniorityToDifficulty(seniority: SeniorityLevel): DifficultyLevel {
  switch (seniority) {
    case "entry":
      return "entry";
    case "junior":
      return "junior";
    case "mid":
      return "middle";
    case "senior":
      return "senior";
    default: {
      const _never: never = seniority;
      throw new Error(`Unhandled seniority: ${_never}`);
    }
  }
}

function mapPositionToTopic(position: string): string | null {
  const normalized = position.trim().toLowerCase();

  switch (normalized) {
    case "frontend":
      return "Frontend Development";
    case "backend":
      return "Backend Development";
    case "fullstack":
      return "General Programming";
    case "devops":
      return "Backend Development";
    case "mobile":
      return "General Programming";
    case "data":
    case "data-scientist":
      return "General Programming";
    case "cybersecurity":
      return "Backend Development";
    case "product-manager":
      return null;
    default:
      return null;
  }
}

function mapPracticeToPlanned(question: Question): PlannedQuestion {
  return {
    id: question.id,
    source: "practice",
    title: question.title,
    prompt: question.prompt,
    meta: {
      topic: question.topic,
      difficulty: question.difficulty,
      techStack: question.primaryTechStack,
    },
  };
}

function plannedFromAiPrompt(prompt: string): PlannedQuestion {
  return {
    id: crypto.randomUUID(),
    source: "ai",
    prompt,
  };
}

function fallbackQuestions(count: number, position: string): PlannedQuestion[] {
  const normalized = position.trim();

  const bank = [
    `Walk me through a recent project you shipped related to ${normalized}. What trade-offs did you make?`,
    `Describe a production bug you debugged. How did you narrow down the root cause?`,
    `How do you approach performance and reliability for ${normalized} work?`,
    `How do you design APIs and data contracts between components/services?`,
    `Explain one decision you would revisit in a system you built and why.`,
    `How do you ensure code quality (testing, linting, reviews) and prevent regressions?`,
    `What would you do in your first 30 days in this role to create impact?`,
  ].map(plannedFromAiPrompt);

  if (count <= 0) return [];

  if (count <= bank.length) {
    return bank.slice(0, count);
  }

  const output: PlannedQuestion[] = [...bank];

  while (output.length < count) {
    output.push(
      plannedFromAiPrompt(
        `Explain a concept you think is essential for a ${normalized} role and how you would teach it to a junior engineer.`,
      ),
    );
  }

  return output.slice(0, count);
}

function normalizePrompt(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function interleaveQuestions(
  practice: PlannedQuestion[],
  ai: PlannedQuestion[],
): PlannedQuestion[] {
  const output: PlannedQuestion[] = [];
  const max = Math.max(practice.length, ai.length);

  for (let i = 0; i < max; i += 1) {
    const p = practice[i];
    if (p) output.push(p);

    const a = ai[i];
    if (a) output.push(a);
  }

  return output;
}

export async function generateTestInterviewQuestionPlan(
  summary: AiPositionSummary,
): Promise<PlannedQuestion[]> {
  const config = configFromSummary(summary);

  if (!config) {
    throw new Error("Interview config incomplete");
  }

  const totalCount = totalQuestionCountFromDuration(config.durationMinutes);
  const practiceCount = practiceQuestionCount(totalCount);
  const aiCount = Math.max(0, totalCount - practiceCount);

  const difficulty = mapSeniorityToDifficulty(config.seniority);
  const topic = mapPositionToTopic(config.position);

  const { questions } = await queryQuestions({
    filters: {
      status: "published",
      difficulty,
      ...(topic ? { topic } : {}),
    },
    limit: Math.max(1, practiceCount * 3),
    orderBy: "random",
  });

  const selectedPractice = questions
    .slice(0, practiceCount)
    .map(mapPracticeToPlanned);
  const practicePrompts = selectedPractice.map((q) =>
    normalizePrompt(q.prompt),
  );

  if (aiCount <= 0) {
    return selectedPractice;
  }

  const mistral = getMistralClient();

  const prompt = `Generate ${aiCount} interview questions for a ${config.seniority}-level ${config.position} role.

Company profile: ${config.companyProfile}
Tech stack: ${config.stack}
Notes: ${config.notes}

Constraints:
- Return ONLY JSON: {"questions": string[]}
- Each question must be a single, complete question.
- Avoid duplicates and avoid paraphrasing the existing questions.
- Do not mention these existing questions:
${practicePrompts.map((q) => `- ${q}`).join("\n")}`;

  const response = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [{ role: "user", content: prompt }],
  });

  const content = readMistralContent(response.choices?.[0]?.message?.content);

  let jsonText = content.trim();
  const firstBrace = jsonText.indexOf("{");
  const lastBrace = jsonText.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonText = jsonText.slice(firstBrace, lastBrace + 1);
  }

  const parsed = aiQuestionsSchema.parse(JSON.parse(jsonText));

  const aiQuestions = parsed.questions
    .map((q) => normalizePrompt(q))
    .filter((q) => q.length > 0)
    .filter((q) => !practicePrompts.includes(q))
    .slice(0, aiCount)
    .map(plannedFromAiPrompt);

  const combined = interleaveQuestions(selectedPractice, aiQuestions);
  const missing = totalCount - combined.length;

  if (missing <= 0) {
    return combined.slice(0, totalCount);
  }

  return [...combined, ...fallbackQuestions(missing, config.position)].slice(
    0,
    totalCount,
  );
}

export async function generateTestInterviewAnswerFeedback(input: {
  summary: AiPositionSummary;
  interviewerId?: string;
  question: string;
  answer: string;
}): Promise<string> {
  const config = configFromSummary(input.summary);

  if (!config) {
    throw new Error("Interview config incomplete");
  }

  const interviewer =
    (input.interviewerId
      ? getInterviewerById(input.interviewerId)
      : undefined) ?? getInterviewerForRole(config.position);

  const mistral = getMistralClient();

  const prompt = `You are ${interviewer.name}, a ${interviewer.title}.

Interviewer persona:
- Personality: ${interviewer.personality}
- Specialties: ${interviewer.specialties.join(", ")}

Interview context:
- Role: ${config.position}
- Seniority: ${config.seniority}
- Tech stack: ${config.stack}

Question:
${input.question}

Candidate answer:
${input.answer}

Task:
- Provide concise feedback (1-3 sentences).
- Do NOT ask any new questions.
- Do NOT suggest what the next question will be.`;

  const response = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [{ role: "user", content: prompt }],
  });

  const content = readMistralContent(response.choices?.[0]?.message?.content);

  return content.trim();
}
