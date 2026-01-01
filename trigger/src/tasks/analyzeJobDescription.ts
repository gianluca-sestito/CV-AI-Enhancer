import { task } from "@trigger.dev/sdk";
import { z } from "zod";
import { mastra } from "../lib/mastra";
import { prisma } from "../lib/prisma/client";
import { fetchProfileData } from "../lib/utils/profile";
import {
  JobRequirementsSchema,
  MatchScoreOutputSchema,
  AnalysisOutputSchema,
} from "../lib/types";

const payloadSchema = z.object({
  userId: z.string(),
  jobDescriptionId: z.string(),
  jobDescription: z.string(),
  analysisResultId: z.string(),
});

export const analyzeJobDescription = task({
  id: "analyze-job-description",
  run: async (payload: z.infer<typeof payloadSchema>) => {
    // Verify analysis record exists
    const analysisRecord = await prisma.analysisResult.findUnique({
      where: { id: payload.analysisResultId },
    });

    if (!analysisRecord) {
      throw new Error("Analysis record not found");
    }

    // Update status to processing
    await prisma.analysisResult.update({
      where: { id: payload.analysisResultId },
      data: { status: "processing" },
    });

    // Fetch profile data
    const profileData = await fetchProfileData(payload.userId);

    // Get the analysis agent
    const agent = mastra.getAgent("analysisAgent");

    // Step 1: Extract job requirements
    const requirementsResult = await agent.generate(
      `Extract structured requirements from this job description. Return ONLY valid JSON with this exact structure:
{
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill3", "skill4"],
  "qualifications": ["qualification1", "qualification2"],
  "experienceLevel": "entry-level" | "mid-level" | "senior" | "executive",
  "keyResponsibilities": ["responsibility1", "responsibility2"]
}

Job Description:
${payload.jobDescription}

Return only the JSON object, no markdown formatting or additional text.`,
      {
        structuredOutput: {
          schema: JobRequirementsSchema,
        },
      }
    );

    const requirements = requirementsResult.object;

    // Step 2: Calculate match score
    const matchScoreResult = await agent.generate(
      `Calculate a detailed match score between this profile and job requirements.

Profile:
- Skills: ${JSON.stringify(profileData.skills.map((s) => s.name))}
- Work Experiences: ${profileData.workExperiences.length} positions
- Education: ${JSON.stringify(
        profileData.education.map(
          (e) => `${e.degree} in ${e.fieldOfStudy || "N/A"}`
        )
      )}

Job Requirements:
- Required Skills: ${JSON.stringify(requirements.requiredSkills)}
- Preferred Skills: ${JSON.stringify(requirements.preferredSkills)}
- Qualifications: ${JSON.stringify(requirements.qualifications)}

Be accurate and consider semantic similarity, not just exact matches. Return only the JSON object.`,
      {
        structuredOutput: {
          schema: MatchScoreOutputSchema,
        },
      }
    );

    const matchScore = matchScoreResult.object;

    // Step 3: Generate comprehensive analysis
    const analysisResult = await agent.generate(
      `Analyze this profile against the job requirements and provide a comprehensive analysis.

Profile Data:
${JSON.stringify(profileData, null, 2)}

Job Requirements:
${JSON.stringify(requirements, null, 2)}

Job Description:
${payload.jobDescription}

Match Score: ${matchScore.matchScore}/100

Provide a detailed analysis with:
1. matchScore (0-100) - use the provided match score
2. strengths (array of { title: string, description: string }) - based ONLY on profile data
3. gaps (array of { title: string, description: string, severity: "low" | "medium" | "high" })
4. missingSkills (array of objects with { name: string, type: 'technical' | 'soft-skill' | 'programming-language' }) 
   - required skills not in profile
   - Categorize each skill:
     * 'programming-language': Actual programming languages (Python, JavaScript, Java, Go, Rust, TypeScript, C++, C#, Swift, Kotlin, etc.)
     * 'technical': Technical tools, frameworks, platforms, methodologies (Docker, Kubernetes, AWS, React, Node.js, Git, CI/CD, etc.)
     * 'soft-skill': Interpersonal and professional skills (Leadership, Communication, Problem-solving, Teamwork, Time Management, etc.)
5. suggestedFocusAreas (array of strings) - actionable recommendations

Return only the JSON object.`,
      {
        structuredOutput: {
          schema: AnalysisOutputSchema,
        },
      }
    );

    const analysis = analysisResult.object;

    // Store results in database
    await prisma.analysisResult.update({
      where: { id: payload.analysisResultId },
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

    return {
      analysisResultId: analysisRecord.id,
      matchScore: analysis.matchScore,
      strengths: analysis.strengths,
      gaps: analysis.gaps,
      missingSkills: analysis.missingSkills,
      suggestedFocusAreas: analysis.suggestedFocusAreas,
    };
  },
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
  },
});
