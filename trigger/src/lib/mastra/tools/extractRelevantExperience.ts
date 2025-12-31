import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { ProfileDataSchema, RelevantExperienceSchema, type ProfileData, type RelevantExperience } from "../../types";
import { extractRelevantExperienceWithLLM } from "../../utils/llm-helpers";

export const extractRelevantExperience = createTool({
  id: "extract-relevant-experience",
  description: "Identifies which experiences and skills from the profile are most relevant to the job",
  inputSchema: z.object({
    profileData: ProfileDataSchema,
    jobDescription: z.string(),
  }),
  outputSchema: RelevantExperienceSchema,
  execute: async ({ context }: { context: { profileData: ProfileData; jobDescription: string } }): Promise<RelevantExperience> => {
    // Use LLM-based extraction for semantic matching instead of keyword matching
    return await extractRelevantExperienceWithLLM(context.profileData, context.jobDescription);
  },
});

