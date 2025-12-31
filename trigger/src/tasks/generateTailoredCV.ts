import { task } from "@trigger.dev/sdk";
import { z } from "zod";
import { mastra } from "../lib/mastra";
import { prisma } from "../lib/prisma/client";
import { fetchProfileData } from "../lib/utils/profile";

export const generateTailoredCV = task({
  id: "generate-tailored-cv",
  run: async (payload: {
    userId: string;
    jobDescriptionId: string;
    analysisResultId?: string;
    jobDescription: string;
    cvId: string;
  }, { ctx }: any) => {
    // 1. Verify CV record exists
    const cvRecord = await prisma.generatedCV.findUnique({
      where: { id: payload.cvId },
    });

    if (!cvRecord) {
      throw new Error("CV record not found");
    }

    try {
      // 2. Fetch profile data from database
      const profileData = await fetchProfileData(payload.userId);

      // 3. Get Mastra workflow
      const workflow = mastra.getWorkflow("cvGenerationWorkflow");
      
      // 4. Execute workflow (handles all steps: extraction, generation, validation, storage)
      const run = await workflow.createRunAsync();
      const workflowRunId = (run as any).id || (run as any).runId || String(Date.now());
      
      // Store workflow run ID for traceability
      await prisma.generatedCV.update({
        where: { id: payload.cvId },
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
          cvId: payload.cvId,
        },
      });

      return {
        cvId: cvRecord.id,
        markdownContent: (result as any).outputData?.markdownContent || "",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      await prisma.generatedCV.update({
        where: { id: cvRecord.id },
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

