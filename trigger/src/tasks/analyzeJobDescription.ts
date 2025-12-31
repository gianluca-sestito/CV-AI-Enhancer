import { task } from "@trigger.dev/sdk";
import { z } from "zod";
import { mastra } from "../lib/mastra";
import { prisma } from "../lib/prisma/client";

export const analyzeJobDescription = task({
  id: "analyze-job-description",
  run: async (payload: {
    userId: string;
    jobDescriptionId: string;
    jobDescription: string;
    profileData: {
      personalSummary: string | null;
      workExperiences: any[];
      skills: any[];
      education: any[];
      languages: any[];
    };
    analysisResultId: string;
  }, { ctx }: any) => {
    // 1. Create analysis record
    const analysisRecord = await prisma.analysisResult.findUnique({
      where: { id: payload.analysisResultId },
    });

    if (!analysisRecord) {
      throw new Error("Analysis record not found");
    }

    try {
      // 2. Get Mastra workflow
      const workflow = mastra.getWorkflow("analysisWorkflow");
      
      // 3. Execute workflow (handles all steps: validation, extraction, analysis, storage)
      const run = await workflow.createRunAsync();
      const result = await run.start({
        inputData: {
          userId: payload.userId,
          jobDescriptionId: payload.jobDescriptionId,
          jobDescription: payload.jobDescription,
          profileData: payload.profileData,
          analysisResultId: payload.analysisResultId,
        },
      });

      return {
        analysisResultId: analysisRecord.id,
        matchScore: (result as any).outputData?.matchScore || 0,
        strengths: (result as any).outputData?.strengths || [],
        gaps: (result as any).outputData?.gaps || [],
        missingSkills: (result as any).outputData?.missingSkills || [],
        suggestedFocusAreas: (result as any).outputData?.suggestedFocusAreas || [],
      };
    } catch (error) {
      await prisma.analysisResult.update({
        where: { id: analysisRecord.id },
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

