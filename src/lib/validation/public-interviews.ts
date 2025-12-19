import { z } from "zod";

const titleSchema = z
  .string()
  .min(1, "Title is required")
  .max(255, "Title must be at most 255 characters");

export const createPublicInterviewLinkSchema = z.object({
  title: titleSchema,
  plan: z.unknown(),
});

export type CreatePublicInterviewLinkRequest = z.infer<
  typeof createPublicInterviewLinkSchema
>;

const requiredString = (field: string) =>
  z.string().min(1, `${field} is required`).max(255, `${field} is too long`);

const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .max(50, "Phone number is too long")
  .regex(/^[+()\-\s\d]+$/, "Enter a valid phone number");

const fileSchema = z.custom<File>((value) => value instanceof File, {
  message: "Invalid file",
});

const MAX_CV_BYTES = 5 * 1024 * 1024;

export const publicInterviewCandidateIntakeSchema = z.object({
  firstName: requiredString("First name").max(100),
  lastName: requiredString("Last name").max(100),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(255, "Email must be at most 255 characters"),
  phone: phoneSchema,
  location: z.string().min(1, "Location is required").max(200),
  cvFile: fileSchema
    .refine((file) => file.size <= MAX_CV_BYTES, {
      message: "CV must be 5MB or smaller",
    })
    .refine((file) => file.type === "application/pdf", {
      message: "CV must be a PDF",
    })
    .optional(),
});

export type PublicInterviewCandidateIntakeRequest = z.infer<
  typeof publicInterviewCandidateIntakeSchema
>;
