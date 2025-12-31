import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { prisma } from "../../prisma/client";
import { validateProfileData } from "../tools/validateProfileData";
import { extractJobRequirements } from "../tools/extractJobRequirements";
import { analysisAgent } from "../agents/analysisAgent";

// Step 1: Validate input data
const validateInputStep = createStep({
  id: "validate-input",
  inputSchema: z.any(),
  outputSchema: z.object({
    isValid: z.boolean(),
    warnings: z.array(z.string()),
  }),
  execute: async ({ inputData, stepResults }: any) => {
    const { profileData } = inputData;
    
    // Use the tool directly instead of through agent
    const validation = await validateProfileData.execute({
      context: { profileData },
    } as any);
    return {
      isValid: validation?.isValid ?? false,
      warnings: validation?.warnings ?? [],
    };
  },
});

// Step 2: Extract job requirements
const extractRequirementsStep = createStep({
  id: "extract-requirements",
  inputSchema: z.any(),
  outputSchema: z.object({
    requirements: z.any(),
  }),
  execute: async ({ inputData, stepResults }: any) => {
    const { jobDescription } = inputData;
    
    // Use the tool directly
    const requirements = await extractJobRequirements.execute({
      context: { jobDescription },
    } as any);

    return {
      requirements,
    };
  },
});

// Step 3: Perform analysis
const performAnalysisStep = createStep({
  id: "perform-analysis",
  inputSchema: z.any(),
  outputSchema: z.object({
    matchScore: z.number(),
    strengths: z.array(z.any()),
    gaps: z.array(z.any()),
    missingSkills: z.array(z.string()),
    suggestedFocusAreas: z.array(z.string()),
  }),
  execute: async ({ inputData, stepResults }: any) => {
    const { profileData, jobDescription } = inputData;
    const { requirements } = stepResults["extract-requirements"];
    const agent = analysisAgent;
    
    const result = await agent.generate(
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

    const analysis = JSON.parse(result.text);
    return {
      matchScore: analysis.matchScore || 0,
      strengths: analysis.strengths || [],
      gaps: analysis.gaps || [],
      missingSkills: analysis.missingSkills || [],
      suggestedFocusAreas: analysis.suggestedFocusAreas || [],
    };
  },
});

// Step 4: Store results
const storeResultsStep = createStep({
  id: "store-results",
  inputSchema: z.any(),
  outputSchema: z.object({
    success: z.boolean(),
  }),
  execute: async ({ inputData, stepResults }: any) => {
    const { analysisResultId } = inputData;
    const analysis = stepResults["perform-analysis"];
    
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
  },
});

export const analysisWorkflow = createWorkflow({
  id: "cv-analysis-workflow",
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
    analysisResultId: z.string(),
  }),
  outputSchema: z.object({
    analysisResultId: z.string(),
    matchScore: z.number(),
    strengths: z.array(z.any()),
    gaps: z.array(z.any()),
    missingSkills: z.array(z.string()),
    suggestedFocusAreas: z.array(z.string()),
  }),
})
  .then(validateInputStep)
  .then(extractRequirementsStep)
  .then(performAnalysisStep)
  .then(storeResultsStep)
  .commit();

