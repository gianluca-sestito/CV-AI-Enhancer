import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { ProfileDataSchema, JobRequirementsSchema, MatchScoreOutputSchema, type ProfileData, type JobRequirements, type MatchScoreOutput } from "../../types";
import { calculateMatchScoreWithLLM } from "../../utils/llm-helpers";

export const calculateMatchScore = createTool({
  id: "calculate-match-score",
  description: "Calculates a match score (0-100) based on profile and job requirements",
  inputSchema: z.object({
    profileData: ProfileDataSchema,
    requirements: JobRequirementsSchema,
  }),
  outputSchema: MatchScoreOutputSchema,
  execute: async ({ context }: { context: { profileData: ProfileData; requirements: JobRequirements } }): Promise<MatchScoreOutput> => {
    // Use LLM-based calculation for more accurate semantic matching
    return await calculateMatchScoreWithLLM(context.profileData, {
      requiredSkills: context.requirements.requiredSkills,
      preferredSkills: context.requirements.preferredSkills,
      qualifications: context.requirements.qualifications,
    });
  },
});

