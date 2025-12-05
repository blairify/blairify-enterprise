import { z } from "zod";

const organisationNameSchema = z
  .string()
  .min(1, "Organisation name is required")
  .max(200, "Organisation name must be at most 200 characters");

export const createOrganisationSchema = z.object({
  name: organisationNameSchema,
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
  industry: z
    .string()
    .max(200, "Industry must be at most 200 characters")
    .optional(),
  location: z
    .string()
    .max(200, "Location must be at most 200 characters")
    .optional(),
  size: z.string().max(100, "Size must be at most 100 characters").optional(),
  website: z
    .string()
    .max(200, "Website must be at most 200 characters")
    .optional(),
  hiringFocus: z
    .string()
    .max(200, "Hiring focus must be at most 200 characters")
    .optional(),
});

export type CreateOrganisationRequest = z.infer<
  typeof createOrganisationSchema
>;
