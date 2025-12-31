import { Agent } from "@mastra/core/agent";
// @ts-ignore - Mastra uses v5 internally
import { openai } from "@ai-sdk/openai-v5";
import { validateProfileData } from "../tools/validateProfileData";
import { extractJobRequirements } from "../tools/extractJobRequirements";
import { calculateMatchScore } from "../tools/calculateMatchScore";

export const analysisAgent = new Agent({
  name: "cv-analysis-agent",
  instructions: `You are an expert CV and job description analyst. Your role is to:
1. Compare user profiles against job descriptions objectively
2. Identify strengths based ONLY on actual profile data
3. Identify gaps honestly without inventing information
4. Calculate accurate match scores (0-100)
5. Provide actionable recommendations

CRITICAL RULES:
- NEVER invent skills, experiences, or qualifications
- If data is missing, explicitly state it
- Base all analysis on the provided profile data only
- Be honest about gaps and missing requirements`,
  model: openai("gpt-4o"),
  tools: {
    validateProfileData,
    extractJobRequirements,
    calculateMatchScore,
  },
});

