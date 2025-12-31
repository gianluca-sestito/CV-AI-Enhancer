import { task } from "@trigger.dev/sdk";
import { z } from "zod";
import { mastra } from "../lib/mastra";
import { prisma } from "../lib/prisma/client";
import { fetchProfileData } from "../lib/utils/profile";

export const analyzeJobDescription = task({
  id: "analyze-job-description",
  run: async (payload: {
    userId: string;
    jobDescriptionId: string;
    jobDescription: string;
    analysisResultId: string;
  }, { ctx }: any) => {
    // 1. Verify analysis record exists
    const analysisRecord = await prisma.analysisResult.findUnique({
      where: { id: payload.analysisResultId },
    });

    if (!analysisRecord) {
      throw new Error("Analysis record not found");
    }

    try {
      // 2. Fetch profile data from database
      const profileData = await fetchProfileData(payload.userId);

      // 3. Get Mastra workflow
      const workflow = mastra.getWorkflow("analysisWorkflow");
      
      // 4. Execute workflow (handles all steps: validation, extraction, analysis, storage)
      const run = await workflow.createRunAsync();
      const workflowRunId = (run as any).id || (run as any).runId || String(Date.now());
      
      // Store workflow run ID for traceability
      await prisma.analysisResult.update({
        where: { id: payload.analysisResultId },
        data: {
          workflowRunId,
          status: "processing",
        },
      });

      const result = await run.start({
        inputData: {
          userId: payload.userId,
          jobDescriptionId: payload.jobDescriptionId,
          jobDescription: payload.jobDescription,
          profileData,
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      await prisma.analysisResult.update({
        where: { id: analysisRecord.id },
        data: {
          status: "failed",
          errorMessage: `${errorMessage}${errorStack ? `\nStack: ${errorStack}` : ""}`,
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

