import { z } from "zod";

export const signupRequestSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Enter a valid work email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
    companyName: z.string().min(1, "Company name is required"),
    companyDomain: z.string().min(1, "Company domain is required"),
    jobTitle: z.string().min(1, "Your role/position is required"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

export type SignupRequest = z.infer<typeof signupRequestSchema>;

export const signupRequestExample: SignupRequest = {
  fullName: "Alex Carter",
  email: "alex.carter@acme.com",
  password: "Blairify!2025",
  confirmPassword: "Blairify!2025",
  companyName: "Acme Talent",
  companyDomain: "acme.com",
  jobTitle: "Head of Talent",
};

export const signinRequestSchema = z.object({
  email: z.string().email("Enter a valid work email"),
  password: z.string().min(1, "Password is required"),
});

export type SigninRequest = z.infer<typeof signinRequestSchema>;

export const signinRequestExample: SigninRequest = {
  email: "alex.carter@acme.com",
  password: "Blairify!2025",
};
