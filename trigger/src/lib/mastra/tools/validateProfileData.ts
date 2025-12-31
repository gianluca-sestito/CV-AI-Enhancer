import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const validateProfileData = createTool({
  id: "validate-profile-data",
  description: "Validates that profile data is complete and structured correctly",
  inputSchema: z.object({
    profileData: z.object({
      personalSummary: z.string().nullable(),
      workExperiences: z.array(z.any()),
      skills: z.array(z.any()),
      education: z.array(z.any()),
      languages: z.array(z.any()),
    }),
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    missingFields: z.array(z.string()),
    warnings: z.array(z.string()),
  }),
  execute: async ({ context }: any) => {
    const { profileData } = context;
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!profileData.personalSummary) {
      missingFields.push("personalSummary");
    }

    if (profileData.workExperiences.length === 0) {
      warnings.push("No work experience provided");
    }

    if (profileData.skills.length === 0) {
      warnings.push("No skills provided");
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
      warnings,
    };
  },
});

