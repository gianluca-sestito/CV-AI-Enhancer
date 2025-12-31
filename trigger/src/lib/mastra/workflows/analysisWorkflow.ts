import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { prisma } from "../../prisma/client";
import { validateProfileData } from "../tools/validateProfileData";
import { extractJobRequirements } from "../tools/extractJobRequirements";
import { analysisAgent } from "../agents/analysisAgent";
import {
  ProfileDataSchema,
  JobRequirementsSchema,
  AnalysisOutputSchema,
  ProfileValidationSchema,
  type ProfileData,
  type JobRequirements,
  type AnalysisOutput,
  type ProfileValidation,
} from "../../types";
import { createErrorMessage } from "../../utils/errors";

// Workflow input schema
const WorkflowInputSchema = z.object({
  userId: z.string(),
  jobDescriptionId: z.string(),
  jobDescription: z.string(),
  profileData: ProfileDataSchema,
  analysisResultId: z.string(),
});

type WorkflowInput = z.infer<typeof WorkflowInputSchema>;

// Step 1: Validate input data
const validateInputStep = createStep({
  id: "validate-input",
  inputSchema: WorkflowInputSchema,
  outputSchema: ProfileValidationSchema,
  execute: async (params: any): Promise<ProfileValidation> => {
    try {
      const { profileData } = params.inputData;
      
      const validation = await validateProfileData.execute({
        context: { profileData },
      } as any);

      return {
        isValid: validation?.isValid ?? false,
        missingFields: validation?.missingFields ?? [],
        warnings: validation?.warnings ?? [],
      };
    } catch (error) {
      throw new Error(`Profile validation failed: ${createErrorMessage(error, "validate-input")}`);
    }
  },
});

// Step 2: Extract job requirements
const extractRequirementsStep = createStep({
  id: "extract-requirements",
  inputSchema: WorkflowInputSchema,
  outputSchema: z.object({
    requirements: JobRequirementsSchema,
  }),
  execute: async (params: any): Promise<{ requirements: JobRequirements }> => {
    try {
      const { jobDescription } = params.inputData;
      
      const requirements = await extractJobRequirements.execute({
        context: { jobDescription },
      } as any);

      return {
        requirements: requirements as JobRequirements,
      };
    } catch (error) {
      throw new Error(`Job requirements extraction failed: ${createErrorMessage(error, "extract-requirements")}`);
    }
  },
});

// Step 3: Perform analysis
const performAnalysisStep = createStep({
  id: "perform-analysis",
  inputSchema: WorkflowInputSchema,
  outputSchema: AnalysisOutputSchema,
  execute: async (params: any): Promise<AnalysisOutput> => {
    try {
      const { profileData, jobDescription } = params.inputData;
      const { requirements } = params.stepResults["extract-requirements"];
      
      const result = await analysisAgent.generate(
        `Analyze this profile against the job requirements. 
        Profile: ${JSON.stringify(profileData)}
        Job Requirements: ${JSON.stringify(requirements)}
        Job Description: ${jobDescription}
        
        Provide a JSON response with:
        1. matchScore (0-100)
        2. strengths (array of { title: string, description: string }) - based ONLY on profile data
        3. gaps (array of { title: string, description: string, severity: "low" | "medium" | "high" })
        4. missingSkills (array of strings)
        5. suggestedFocusAreas (array of strings)
        
        Return as JSON object.`
      );

      const analysis = JSON.parse(result.text) as Partial<AnalysisOutput>;
      return {
        matchScore: analysis.matchScore ?? 0,
        strengths: analysis.strengths ?? [],
        gaps: analysis.gaps ?? [],
        missingSkills: analysis.missingSkills ?? [],
        suggestedFocusAreas: analysis.suggestedFocusAreas ?? [],
      };
    } catch (error) {
      throw new Error(`Analysis failed: ${createErrorMessage(error, "perform-analysis")}`);
    }
  },
});

// Step 4: Store results
const storeResultsStep = createStep({
  id: "store-results",
  inputSchema: WorkflowInputSchema,
  outputSchema: z.object({
    success: z.boolean(),
  }),
  execute: async (params: any): Promise<{ success: boolean }> => {
    try {
      const { analysisResultId } = params.inputData;
      const analysis = params.stepResults["perform-analysis"];
      
      await prisma.analysisResult.update({
        where: { id: analysisResultId },
        data: {
          matchScore: analysis.matchScore,
          strengths: analysis.strengths,
          gaps: analysis.gaps,
          missingSkills: analysis.missingSkills,
          suggestedFocusAreas: analysis.suggestedFocusAreas,
          rawAnalysis: analysis,
          status: "completed",
          completedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to store analysis results: ${createErrorMessage(error, "store-results")}`);
    }
  },
});

export const analysisWorkflow = createWorkflow({
  id: "cv-analysis-workflow",
  inputSchema: WorkflowInputSchema,
  outputSchema: z.object({
    analysisResultId: z.string(),
    matchScore: z.number(),
    strengths: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })),
    gaps: z.array(z.object({
      title: z.string(),
      description: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    })),
    missingSkills: z.array(z.string()),
    suggestedFocusAreas: z.array(z.string()),
  }),
})
  .then(validateInputStep as any)
  .then(extractRequirementsStep as any)
  .then(performAnalysisStep as any)
  .then(storeResultsStep as any)
  .commit();

