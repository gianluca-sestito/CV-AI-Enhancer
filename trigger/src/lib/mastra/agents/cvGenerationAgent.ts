import { Agent } from "@mastra/core/agent";
// @ts-ignore - Mastra uses v5 internally
import { openai } from "@ai-sdk/openai-v5";
import { validateCVContent } from "../tools/validateCVContent";
import { extractRelevantExperience } from "../tools/extractRelevantExperience";

export const cvGenerationAgent = new Agent({
  name: "cv-generation-agent",
  instructions: `You are an expert CV writer specializing in tailoring CVs to job descriptions. Your role is to:
1. Rephrase and restructure existing profile data
2. Highlight relevant experiences for the job
3. Use professional, clear language
4. Format output as clean Markdown

CRITICAL RULES:
- ONLY use information from the provided profile
- NEVER add, invent, or exaggerate any information
- If a section is missing from profile, omit it or note it explicitly
- Rephrase for clarity and impact, but stay truthful
- Maintain professional tone and structure`,
  model: openai("gpt-4o"),
  tools: {
    validateCVContent,
    extractRelevantExperience,
  },
});

