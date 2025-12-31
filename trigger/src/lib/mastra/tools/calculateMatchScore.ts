import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const calculateMatchScore = createTool({
  id: "calculate-match-score",
  description: "Calculates a match score (0-100) based on profile and job requirements",
  inputSchema: z.object({
    profileData: z.object({
      skills: z.array(z.any()),
      workExperiences: z.array(z.any()),
      education: z.array(z.any()),
    }),
    requirements: z.object({
      requiredSkills: z.array(z.string()),
      preferredSkills: z.array(z.string()),
      qualifications: z.array(z.string()),
    }),
  }),
  outputSchema: z.object({
    matchScore: z.number().min(0).max(100),
    breakdown: z.object({
      skillsMatch: z.number(),
      experienceMatch: z.number(),
      educationMatch: z.number(),
    }),
  }),
  execute: async ({ context }: any) => {
    const { profileData, requirements } = context;
    
    // Simple matching algorithm
    const profileSkills = profileData.skills.map((s: any) => s.name.toLowerCase());
    const requiredSkills = requirements.requiredSkills.map((s: string) => s.toLowerCase());
    const preferredSkills = requirements.preferredSkills.map((s: string) => s.toLowerCase());
    
    const requiredMatches = requiredSkills.filter((skill: string) =>
      profileSkills.some((ps: string) => ps.includes(skill) || skill.includes(ps))
    ).length;
    
    const preferredMatches = preferredSkills.filter((skill: string) =>
      profileSkills.some((ps: string) => ps.includes(skill) || skill.includes(ps))
    ).length;
    
    const skillsMatch = requiredSkills.length > 0
      ? (requiredMatches / requiredSkills.length) * 100
      : 50;
    
    const experienceMatch = profileData.workExperiences.length > 0 ? 50 : 0;
    const educationMatch = profileData.education.length > 0 ? 50 : 0;
    
    const matchScore = Math.round(
      (skillsMatch * 0.6) + (experienceMatch * 0.25) + (educationMatch * 0.15)
    );
    
    return {
      matchScore: Math.min(100, Math.max(0, matchScore)),
      breakdown: {
        skillsMatch,
        experienceMatch,
        educationMatch,
      },
    };
  },
});

