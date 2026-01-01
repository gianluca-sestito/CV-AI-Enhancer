import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { JobRequirementsSchema, type JobRequirements } from "../../types";

/**
 * @deprecated This tool is no longer used. Job requirements extraction is now done
 * directly in the analyzeJobDescription task using agents with structured output.
 * This tool is kept for reference but should not be used in new code.
 */
export const extractJobRequirements = createTool({
  id: "extract-job-requirements",
  description: "Extracts key requirements, skills, and qualifications from job description",
  inputSchema: z.object({
    jobDescription: z.string(),
  }),
  outputSchema: JobRequirementsSchema,
  execute: async ({ context }: { context: { jobDescription: string } }): Promise<JobRequirements> => {
    throw new Error(
      "This tool is deprecated. Use the analysisAgent directly with structured output instead."
    );
  },
});

