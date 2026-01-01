// Zod schemas for API validation
import { z } from "zod";
import { CVDataSchema } from "@/trigger/src/lib/types/cvSchemas";

// Schema for updating CV structured content
export const updateCVSchema = z.object({
  structuredContent: CVDataSchema.optional(),
  markdownContent: z.string().optional(), // Deprecated, kept for backward compatibility
});

export type UpdateCVRequest = z.infer<typeof updateCVSchema>;

