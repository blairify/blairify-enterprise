import { z } from "zod";

export const createCandidateSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(255, "Full name must be at most 255 characters"),
  email: z
    .string()
    .email("Enter a valid email address")
    .max(255, "Email must be at most 255 characters")
    .optional(),
  headline: z
    .string()
    .max(255, "Headline must be at most 255 characters")
    .optional(),
  location: z
    .string()
    .max(200, "Location must be at most 200 characters")
    .optional(),
  seniority: z
    .string()
    .max(100, "Seniority must be at most 100 characters")
    .optional(),
  currentCompany: z
    .string()
    .max(255, "Current company must be at most 255 characters")
    .optional(),
  linkedInUrl: z
    .string()
    .url("Enter a valid LinkedIn URL")
    .max(500, "LinkedIn URL must be at most 500 characters")
    .optional(),
  githubUrl: z
    .string()
    .url("Enter a valid GitHub URL")
    .max(500, "GitHub URL must be at most 500 characters")
    .optional(),
  cvUrl: z
    .string()
    .url("Enter a valid CV URL")
    .max(500, "CV URL must be at most 500 characters")
    .optional(),
  notes: z
    .string()
    .max(2000, "Notes must be at most 2000 characters")
    .optional(),
});

export type CreateCandidateRequest = z.infer<typeof createCandidateSchema>;

export const createCandidateExample: CreateCandidateRequest = {
  fullName: "Jordan Lee",
  email: "jordan.lee@example.com",
  headline: "Senior Backend Engineer",
  location: "Berlin, Germany",
  seniority: "Senior",
  currentCompany: "Acme Corp",
  linkedInUrl: "https://www.linkedin.com/in/jordanlee",
  githubUrl: "https://github.com/jordanlee",
  cvUrl: "https://example.com/cv/jordan-lee.pdf",
  notes: "Interested in senior backend roles with distributed systems focus.",
};
