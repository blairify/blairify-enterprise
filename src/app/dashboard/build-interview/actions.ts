"use server";

import { Mistral } from "@mistralai/mistralai";
import { z } from "zod";

export type AiChatRole = "user" | "assistant" | "system";

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

type MistralContentChunk =
  | {
      text?: string;
    }
  | string;

const aiPositionSummarySchema = z.object({
  position: z.string(),
  seniority: z.string(),
  companyProfile: z.string(),
  mode: z.string(),
  notes: z.string(),
  duration: z.string().default(""),
  stack: z.string().default(""),
});

export type AiPositionSummary = z.infer<typeof aiPositionSummarySchema>;

const jobListingQuestionsSchema = z.object({
  questions: z.array(z.string()),
  notes: z.string().default(""),
});

export type JobListingQuestions = z.infer<typeof jobListingQuestionsSchema>;

function getMistralClient(): Mistral {
  const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;

  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is not configured");
  }

  return new Mistral({
    apiKey,
  });
}

export async function aiChatRespond(
  messages: AiChatMessage[],
): Promise<AiChatMessage> {
  const mistral = getMistralClient();

  const systemMessage: AiChatMessage = {
    role: "system",
    content:
      "You are Blairify's interview builder assistant. Help an enterprise recruiter design a structured interview. Your primary goal is to converge on: (1) position/role, (2) seniority level, (3) technical stack, (4) company profile, and (5) interview duration. Ask focused follow-up questions until each of these is clear. Keep answers concise and actionable.",
  };

  const response = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [systemMessage, ...messages],
  });

  const choice = response.choices?.[0];
  const rawContent = choice?.message?.content as
    | string
    | MistralContentChunk[]
    | undefined;
  let content = "";

  if (Array.isArray(rawContent)) {
    content = rawContent
      .map((chunk) => (typeof chunk === "string" ? chunk : (chunk.text ?? "")))
      .join("");
  } else if (typeof rawContent === "string") {
    content = rawContent;
  }

  return {
    role: "assistant",
    content,
  };
}

export async function aiSummarizePosition(
  messages: AiChatMessage[],
): Promise<AiPositionSummary> {
  const mistral = getMistralClient();

  const transcript = messages
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");

  const prompt = `You are Blairify's interview builder assistant.\n\nBased on the conversation below between a recruiter and you, infer the key parameters needed to configure a technical interview.\n\nReturn ONLY a JSON object with this exact shape and no extra text: {\n  "position": string,\n  "seniority": string,\n  "companyProfile": string,\n  "mode": string,\n  "notes": string,\n  "duration": string,\n  "stack": string\n}.\n\nUse "unknown" for any field you cannot reliably infer.\n\nConversation:\n${transcript}`;

  const response = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const rawContent = response.choices?.[0]?.message?.content as
    | string
    | MistralContentChunk[]
    | undefined;
  let content = "";

  if (Array.isArray(rawContent)) {
    content = rawContent
      .map((chunk) => (typeof chunk === "string" ? chunk : (chunk.text ?? "")))
      .join("");
  } else if (typeof rawContent === "string") {
    content = rawContent;
  }

  try {
    let jsonText = content.trim();
    const firstBrace = jsonText.indexOf("{");
    const lastBrace = jsonText.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = jsonText.slice(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(jsonText) as unknown;
    const validated = aiPositionSummarySchema.parse(parsed);

    return validated;
  } catch {
    return {
      position: "unknown",
      seniority: "unknown",
      companyProfile: "unknown",
      mode: "regular",
      notes: content || "No summary available.",
      duration: "unknown",
      stack: "unknown",
    };
  }
}

export async function aiGenerateQuestionsFromJobListing(
  jobListing: string,
): Promise<JobListingQuestions> {
  const mistral = getMistralClient();

  const prompt = `You are Blairify's interview builder assistant.\n\nGiven the following job listing, generate a focused set of interview questions that a hiring manager or recruiter could ask a candidate.\n\nReturn ONLY a JSON object with this exact shape and no extra text: {\n  "questions": string[],\n  "notes": string\n}.\n\nJob listing:\n${jobListing}`;

  const response = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const rawContent = response.choices?.[0]?.message?.content as
    | string
    | MistralContentChunk[]
    | undefined;
  let content = "";

  if (Array.isArray(rawContent)) {
    content = rawContent
      .map((chunk) => (typeof chunk === "string" ? chunk : (chunk.text ?? "")))
      .join("");
  } else if (typeof rawContent === "string") {
    content = rawContent;
  }

  try {
    let jsonText = content.trim();
    const firstBrace = jsonText.indexOf("{");
    const lastBrace = jsonText.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = jsonText.slice(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(jsonText) as unknown;
    const validated = jobListingQuestionsSchema.parse(parsed);

    return validated;
  } catch {
    return {
      questions: [],
      notes: content || "No questions available.",
    };
  }
}
