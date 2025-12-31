import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { prisma } from "../../prisma/client";
import { extractRelevantExperience } from "../tools/extractRelevantExperience";
import { validateCVContent } from "../tools/validateCVContent";
import { cvGenerationAgent } from "../agents/cvGenerationAgent";
import {
  ProfileDataSchema,
  RelevantExperienceSchema,
  CVValidationSchema,
  type ProfileData,
  type RelevantExperience,
  type CVValidation,
} from "../../types";
import { createErrorMessage } from "../../utils/errors";

// Workflow input schema
const WorkflowInputSchema = z.object({
  userId: z.string(),
  jobDescriptionId: z.string(),
  jobDescription: z.string(),
  profileData: ProfileDataSchema,
  cvId: z.string(),
});

type WorkflowInput = z.infer<typeof WorkflowInputSchema>;

// Step 1: Extract relevant experience
const extractRelevantStep = createStep({
  id: "extract-relevant",
  inputSchema: WorkflowInputSchema,
  outputSchema: z.object({
    relevantData: RelevantExperienceSchema,
  }),
  execute: async (params: any): Promise<{ relevantData: RelevantExperience }> => {
    try {
      const { profileData, jobDescription } = params.inputData;
      
      const relevantData = await extractRelevantExperience.execute({
        context: {
          profileData,
          jobDescription,
        },
      } as any);

      return {
        relevantData: relevantData as RelevantExperience,
      };
    } catch (error) {
      throw new Error(`Failed to extract relevant experience: ${createErrorMessage(error, "extract-relevant")}`);
    }
  },
});

// Step 2: Generate CV
const generateCVStep = createStep({
  id: "generate-cv",
  inputSchema: WorkflowInputSchema,
  outputSchema: z.object({
    markdownContent: z.string(),
  }),
  execute: async (params: any): Promise<{ markdownContent: string }> => {
    try {
      const { profileData, jobDescription } = params.inputData;
      const { relevantData } = params.stepResults["extract-relevant"];
      
      const result = await cvGenerationAgent.generate(
        `Generate a tailored CV in Markdown format based on this profile data: ${JSON.stringify(profileData)}
        
        Job Description: ${jobDescription}
        
        Relevant highlights: ${JSON.stringify(relevantData)}
        
        Remember: ONLY use information from the profile. Do not invent anything. Format as clean Markdown with proper sections.`,
      );

      return {
        markdownContent: result.text,
      };
    } catch (error) {
      throw new Error(`CV generation failed: ${createErrorMessage(error, "generate-cv")}`);
    }
  },
});

// Step 3: Validate CV
const validateCVStep = createStep({
  id: "validate-cv",
  inputSchema: WorkflowInputSchema,
  outputSchema: z.object({
    isValid: z.boolean(),
  }),
  execute: async (params: any): Promise<{ isValid: boolean }> => {
    try {
      const { profileData } = params.inputData;
      const { markdownContent } = params.stepResults["generate-cv"];
      
      const validation = await validateCVContent.execute({
        context: {
          cvContent: markdownContent,
          profileData,
        },
      } as any) as CVValidation;
      
      if (!validation?.isValid) {
        throw new Error(`CV validation failed: ${validation?.violations?.join(", ") || "Unknown error"}`);
      }

      return { isValid: true };
    } catch (error) {
      throw new Error(`CV validation failed: ${createErrorMessage(error, "validate-cv")}`);
    }
  },
});

// Step 4: Store CV
const storeCVStep = createStep({
  id: "store-cv",
  inputSchema: WorkflowInputSchema,
  outputSchema: z.object({
    success: z.boolean(),
  }),
  execute: async (params: any): Promise<{ success: boolean }> => {
    try {
      const { cvId } = params.inputData;
      const { markdownContent } = params.stepResults["generate-cv"];
      
      await prisma.generatedCV.update({
        where: { id: cvId },
        data: {
          markdownContent,
          status: "completed",
          completedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to store CV: ${createErrorMessage(error, "store-cv")}`);
    }
  },
});

export const cvGenerationWorkflow = createWorkflow({
  id: "cv-generation-workflow",
  inputSchema: WorkflowInputSchema,
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

