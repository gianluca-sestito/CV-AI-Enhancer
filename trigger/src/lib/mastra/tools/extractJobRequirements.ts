import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { JobRequirementsSchema, type JobRequirements } from "../../types";
import { extractJobRequirementsWithLLM } from "../../utils/llm-helpers";

export const extractJobRequirements = createTool({
  id: "extract-job-requirements",
  description: "Extracts key requirements, skills, and qualifications from job description",
  inputSchema: z.object({
    jobDescription: z.string(),
  }),
  outputSchema: JobRequirementsSchema,
  execute: async ({ context }: { context: { jobDescription: string } }): Promise<JobRequirements> => {
    // Use LLM-based extraction for accurate requirement extraction
    return await extractJobRequirementsWithLLM(context.jobDescription);
  },
});

