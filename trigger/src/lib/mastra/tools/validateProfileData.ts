import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { ProfileDataSchema, ProfileValidationSchema, type ProfileData, type ProfileValidation } from "../../types";

export const validateProfileData = createTool({
  id: "validate-profile-data",
  description: "Validates that profile data is complete and structured correctly",
  inputSchema: z.object({
    profileData: ProfileDataSchema,
  }),
  outputSchema: ProfileValidationSchema,
  execute: async ({ context }: { context: { profileData: ProfileData } }): Promise<ProfileValidation> => {
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

