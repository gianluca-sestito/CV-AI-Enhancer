import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const extractRelevantExperience = createTool({
  id: "extract-relevant-experience",
  description: "Identifies which experiences and skills from the profile are most relevant to the job",
  inputSchema: z.object({
    profileData: z.object({
      workExperiences: z.array(z.any()),
      skills: z.array(z.any()),
      education: z.array(z.any()),
    }),
    jobDescription: z.string(),
  }),
  outputSchema: z.object({
    relevantExperiences: z.array(z.string()),
    relevantSkills: z.array(z.string()),
    relevantEducation: z.array(z.string()),
  }),
  execute: async ({ context }: any) => {
    const { profileData, jobDescription } = context;
    const jobLower = jobDescription.toLowerCase();
    
    // Simple keyword matching - can be enhanced with LLM
    const relevantExperiences = profileData.workExperiences
      .filter((exp: any) => {
        const expText = `${exp.company} ${exp.position} ${exp.description}`.toLowerCase();
        // Check if any keywords from job description appear in experience
        return jobLower.split(/\s+/).some((word: string) => 
          word.length > 4 && expText.includes(word)
        );
      })
      .map((exp: any) => exp.id);
    
    const relevantSkills = profileData.skills
      .filter((skill: any) => {
        return jobLower.includes(skill.name.toLowerCase());
      })
      .map((skill: any) => skill.name);
    
    const relevantEducation = profileData.education
      .filter((edu: any) => {
        const eduText = `${edu.institution} ${edu.degree} ${edu.fieldOfStudy || ""}`.toLowerCase();
        return jobLower.split(/\s+/).some((word: string) => 
          word.length > 4 && eduText.includes(word)
        );
      })
      .map((edu: any) => edu.id);
    
    return {
      relevantExperiences,
      relevantSkills,
      relevantEducation,
    };
  },
});

