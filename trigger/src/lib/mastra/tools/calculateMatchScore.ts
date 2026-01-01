import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { ProfileDataSchema, JobRequirementsSchema, MatchScoreOutputSchema, type ProfileData, type JobRequirements, type MatchScoreOutput } from "../../types";

/**
 * @deprecated This tool is no longer used. Match score calculation is now done
 * directly in the analyzeJobDescription task using agents with structured output.
 * This tool is kept for reference but should not be used in new code.
 */
export const calculateMatchScore = createTool({
  id: "calculate-match-score",
  description: "Calculates a match score (0-100) based on profile and job requirements",
  inputSchema: z.object({
    profileData: ProfileDataSchema,
    requirements: JobRequirementsSchema,
  }),
  outputSchema: MatchScoreOutputSchema,
  execute: async ({ context }: { context: { profileData: ProfileData; requirements: JobRequirements } }): Promise<MatchScoreOutput> => {
    throw new Error(
      "This tool is deprecated. Use the analysisAgent directly with structured output instead."
    );
  },
});

