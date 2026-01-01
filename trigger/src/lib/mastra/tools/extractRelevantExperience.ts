import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { ProfileDataSchema, RelevantExperienceSchema, type ProfileData, type RelevantExperience } from "../../types";

/**
 * @deprecated This tool is no longer used. Relevant experience extraction is now handled
 * directly by the cvGenerationAgent in the generateTailoredCV task.
 * This tool is kept for reference but should not be used in new code.
 */
export const extractRelevantExperience = createTool({
  id: "extract-relevant-experience",
  description: "Identifies which experiences and skills from the profile are most relevant to the job",
  inputSchema: z.object({
    profileData: ProfileDataSchema,
    jobDescription: z.string(),
  }),
  outputSchema: RelevantExperienceSchema,
  execute: async ({ context }: { context: { profileData: ProfileData; jobDescription: string } }): Promise<RelevantExperience> => {
    throw new Error(
      "This tool is deprecated. Use the cvGenerationAgent directly instead."
    );
  },
});

