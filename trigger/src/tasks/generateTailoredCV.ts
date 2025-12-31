import { task } from "@trigger.dev/sdk";
import { z } from "zod";
import { mastra } from "../lib/mastra";
import { prisma } from "../lib/prisma/client";

export const generateTailoredCV = task({
  id: "generate-tailored-cv",
  run: async (payload: {
    userId: string;
    jobDescriptionId: string;
    analysisResultId?: string;
    jobDescription: string;
    profileData: {
      personalSummary: string | null;
      workExperiences: any[];
      skills: any[];
      education: any[];
      languages: any[];
    };
    cvId: string;
  }, { ctx }: any) => {
    // 1. Create CV record
    const cvRecord = await prisma.generatedCV.findUnique({
      where: { id: payload.cvId },
    });

    if (!cvRecord) {
      throw new Error("CV record not found");
    }

    try {
      // 2. Get Mastra workflow
      const workflow = mastra.getWorkflow("cvGenerationWorkflow");
      
      // 3. Execute workflow (handles all steps: extraction, generation, validation, storage)
      const run = await workflow.createRunAsync();
      const result = await run.start({
        inputData: {
          userId: payload.userId,
          jobDescriptionId: payload.jobDescriptionId,
          jobDescription: payload.jobDescription,
          profileData: payload.profileData,
          cvId: payload.cvId,
        },
      });

      return {
        cvId: cvRecord.id,
        markdownContent: (result as any).outputData?.markdownContent || "",
      };
    } catch (error) {
      await prisma.generatedCV.update({
        where: { id: cvRecord.id },
        data: {
          status: "failed",
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  },
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
  },
});

