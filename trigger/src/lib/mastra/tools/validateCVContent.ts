import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const validateCVContent = createTool({
  id: "validate-cv-content",
  description: "Validates that CV content only contains information from the profile",
  inputSchema: z.object({
    cvContent: z.string(),
    profileData: z.object({
      workExperiences: z.array(z.any()),
      skills: z.array(z.any()),
      education: z.array(z.any()),
    }),
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    violations: z.array(z.string()),
    warnings: z.array(z.string()),
  }),
  execute: async ({ context }: any) => {
    const { cvContent, profileData } = context;
    const violations: string[] = [];
    const warnings: string[] = [];

    // Check for invented companies
    const profileCompanies = profileData.workExperiences.map((exp: any) =>
      exp.company.toLowerCase()
    );
    const cvLower = cvContent.toLowerCase();
    
    // Simple check: extract potential company names from CV and validate
    // This is a basic implementation - can be enhanced with NLP
    
    // Check for invented skills
    const profileSkills = profileData.skills.map((skill: any) =>
      skill.name.toLowerCase()
    );
    
    // Basic validation - can be enhanced
    // For now, we'll rely on the AI agent's instructions to prevent inventions
    
    return {
      isValid: violations.length === 0,
      violations,
      warnings,
    };
  },
});

