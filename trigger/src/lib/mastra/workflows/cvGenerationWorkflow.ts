import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { prisma } from "../../prisma/client";
import { extractRelevantExperience } from "../tools/extractRelevantExperience";
import { validateCVContent } from "../tools/validateCVContent";
import { cvGenerationAgent } from "../agents/cvGenerationAgent";

// Step 1: Extract relevant experience
const extractRelevantStep = createStep({
  id: "extract-relevant",
  inputSchema: z.any(),
  outputSchema: z.object({
    relevantData: z.any(),
  }),
  execute: async ({ inputData, stepResults }: any) => {
    const { profileData, jobDescription } = inputData;
    
    // Use the tool directly
    const relevantData = await extractRelevantExperience.execute({
      context: {
        profileData,
        jobDescription,
      },
    } as any);

    return {
      relevantData,
    };
  },
});

// Step 2: Generate CV
const generateCVStep = createStep({
  id: "generate-cv",
  inputSchema: z.any(),
  outputSchema: z.object({
    markdownContent: z.string(),
  }),
  execute: async ({ inputData, stepResults }: any) => {
    const { profileData, jobDescription } = inputData;
    const { relevantData } = stepResults["extract-relevant"];
    const agent = cvGenerationAgent;
    
    const result = await agent.generate(
      `Generate a tailored CV in Markdown format based on this profile data: ${JSON.stringify(profileData)}
      
      Job Description: ${jobDescription}
      
      Relevant highlights: ${JSON.stringify(relevantData)}
      
      Remember: ONLY use information from the profile. Do not invent anything. Format as clean Markdown with proper sections.`,
    );

    return {
      markdownContent: result.text,
    };
  },
});

// Step 3: Validate CV
const validateCVStep = createStep({
  id: "validate-cv",
  inputSchema: z.any(),
  outputSchema: z.object({
    isValid: z.boolean(),
  }),
  execute: async ({ inputData, stepResults }: any) => {
    const { profileData } = inputData;
    const { markdownContent } = stepResults["generate-cv"];
    
    // Use the tool directly
    const validation = await validateCVContent.execute({
      context: {
        cvContent: markdownContent,
        profileData,
      },
    } as any);
    
    if (!validation?.isValid) {
      throw new Error(`CV validation failed: ${validation?.violations?.join(", ") || "Unknown error"}`);
    }

    return { isValid: true };
  },
});

// Step 4: Store CV
const storeCVStep = createStep({
  id: "store-cv",
  inputSchema: z.any(),
  outputSchema: z.object({
    success: z.boolean(),
  }),
  execute: async ({ inputData, stepResults }: any) => {
    const { cvId } = inputData;
    const { markdownContent } = stepResults["generate-cv"];
    
    await prisma.generatedCV.update({
      where: { id: cvId },
      data: {
        markdownContent,
        status: "completed",
        completedAt: new Date(),
      },
    });

    return { success: true };
  },
});

export const cvGenerationWorkflow = createWorkflow({
  id: "cv-generation-workflow",
  inputSchema: z.object({
    userId: z.string(),
    jobDescriptionId: z.string(),
    jobDescription: z.string(),
    profileData: z.object({
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      email: z.string().nullable(),
      phone: z.string().nullable(),
      location: z.string().nullable(),
      address: z.string().nullable(),
      city: z.string().nullable(),
      country: z.string().nullable(),
      postalCode: z.string().nullable(),
      profileImageUrl: z.string().nullable(),
      personalSummary: z.string().nullable(),
      workExperiences: z.array(z.any()),
      skills: z.array(z.any()),
      education: z.array(z.any()),
      languages: z.array(z.any()),
    }),
    cvId: z.string(),
  }),
  outputSchema: z.object({
    cvId: z.string(),
    markdownContent: z.string(),
  }),
})
  .then(extractRelevantStep)
  .then(generateCVStep)
  .then(validateCVStep)
  .then(storeCVStep)
  .commit();

