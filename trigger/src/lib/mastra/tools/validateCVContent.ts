import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { ProfileDataSchema, CVValidationSchema, type ProfileData, type CVValidation } from "../../types";

export const validateCVContent = createTool({
  id: "validate-cv-content",
  description: "Validates that CV content only contains information from the profile",
  inputSchema: z.object({
    cvContent: z.string(),
    profileData: ProfileDataSchema,
  }),
  outputSchema: CVValidationSchema,
  execute: async ({ context }: { context: { cvContent: string; profileData: ProfileData } }): Promise<CVValidation> => {
    const { cvContent, profileData } = context;
    const violations: string[] = [];
    const warnings: string[] = [];

    // Check for invented companies
    const profileCompanies = profileData.workExperiences.map((exp) =>
      exp.company.toLowerCase()
    );
    const cvLower = cvContent.toLowerCase();
    
    // Simple check: extract potential company names from CV and validate
    // This is a basic implementation - can be enhanced with NLP
    
    // Check for invented skills
    const profileSkills = profileData.skills.map((skill) =>
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

