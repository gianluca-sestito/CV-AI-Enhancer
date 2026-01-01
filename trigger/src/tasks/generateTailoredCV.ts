import { task } from "@trigger.dev/sdk";
import { z } from "zod";
import { mastra } from "../lib/mastra";
import { prisma } from "../lib/prisma/client";
import { fetchProfileData } from "../lib/utils/profile";
import { expandAllRelatedSkills } from "../lib/utils/skillExpansion";
import { scoreAndSortWorkExperiences, scoreAndSortSkills } from "../lib/utils/relevanceScorer";
import { JobRequirementsSchema, type AnalysisOutput } from "../lib/types";
import { CVStructureSchema, CVContentSchema, CVDataSchema, type CVData } from "../lib/types/cvSchemas";

const payloadSchema = z.object({
  userId: z.string(),
  jobDescriptionId: z.string(),
  analysisResultId: z.string(),
  jobDescription: z.string(),
  cvId: z.string(),
});

export const generateTailoredCV = task({
  id: "generate-tailored-cv",
  run: async (payload: z.infer<typeof payloadSchema>) => {
    // Verify CV record exists
    const cvRecord = await prisma.generatedCV.findUnique({
      where: { id: payload.cvId },
    });

    if (!cvRecord) {
      throw new Error("CV record not found");
    }

    // Update status to processing
    await prisma.generatedCV.update({
      where: { id: payload.cvId },
      data: { status: "processing" },
    });

    // Fetch analysis result
    const analysisResult = await prisma.analysisResult.findUnique({
      where: { id: payload.analysisResultId },
    });

    if (!analysisResult) {
      throw new Error("Analysis result not found");
    }

    if (analysisResult.status !== "completed") {
      throw new Error("Analysis result is not completed yet");
    }

    // Parse analysis data
    const analysis = analysisResult.rawAnalysis as AnalysisOutput | null;
    if (!analysis) {
      throw new Error("Analysis data is missing");
    }

    // Fetch profile data
    const profileData = await fetchProfileData(payload.userId);

    // Reuse job requirements from analysis (already extracted during analysis)
    const jobRequirements = (analysisResult as any).jobRequirements as z.infer<typeof JobRequirementsSchema> | null;
    if (!jobRequirements) {
      throw new Error("Job requirements not found in analysis result. Please re-run the analysis.");
    }

    // Expand related skills (e.g., Java → Spring Boot, Maven)
    const relatedSkills = expandAllRelatedSkills(
      jobRequirements.requiredSkills,
      profileData.skills
    );

    // Score and sort work experiences by relevance
    const scoredExperiences = scoreAndSortWorkExperiences(
      profileData.workExperiences,
      jobRequirements
    );

    // Score and sort skills by relevance
    const scoredSkills = scoreAndSortSkills(
      profileData.skills,
      jobRequirements.requiredSkills,
      jobRequirements.preferredSkills,
      relatedSkills
    );

    // Filter skills to only show top 15-20 most relevant
    const filteredSkills = scoredSkills.filter(s => s.score >= 5).slice(0, 20);

    // Step 1: Structure Agent - Determine CV structure and organization
    const structureAgent = mastra.getAgent("structureAgent");
    const structureResult = await structureAgent.generate(
      `Analyze the profile data, job requirements, and relevance scores to determine the optimal CV structure.

## Job Requirements:
- Required Skills: ${JSON.stringify(jobRequirements.requiredSkills)}
- Preferred Skills: ${JSON.stringify(jobRequirements.preferredSkills)}
- Key Responsibilities: ${JSON.stringify(jobRequirements.keyResponsibilities)}
- Experience Level: ${jobRequirements.experienceLevel}

## Analysis Results:
- Match Score: ${analysis.matchScore}/100
- Strengths: ${JSON.stringify(analysis.strengths, null, 2)}

## Profile Data Summary:
- Name: ${profileData.firstName} ${profileData.lastName}
- Profile Image: ${profileData.profileImageUrl ? "Available" : "Not available"}
- Work Experiences: ${profileData.workExperiences.length} positions
- Skills: ${profileData.skills.length} skills
- Education: ${profileData.education.length} entries
- Languages: ${profileData.languages.length} languages

## Scored Experiences:
${scoredExperiences.map((scored, idx) => `
${idx + 1}. Experience ID: ${scored.experience.id}
   Position: ${scored.experience.position} at ${scored.experience.company}
   Relevance Score: ${scored.score}/100
   Detail Level: ${scored.score >= 10 ? "detailed" : "brief"}
`).join("\n")}

## Scored Skills (filtered to top 20 most relevant):
${filteredSkills.map((scored, idx) => `
${idx + 1}. Skill ID: ${scored.skill.id}
   Name: ${scored.skill.name}
   Category: ${scored.category}
   Relevance Score: ${scored.score}
   Proficiency: ${scored.skill.proficiencyLevel || "Not specified"}
`).join("\n")}

## Related Skills (expanded):
${relatedSkills.map(skill => `- ${skill.name} (ID: ${skill.id})`).join("\n")}

Determine the CV structure including:
- Which sections to include
- Order of sections
- Experience ordering and detail levels (detailed vs brief)
- **Intelligently group skills into 3-5 technology categories** (e.g., "Backend Technologies", "Cloud Platforms", "AI/ML Tools")
- Use semantic understanding to group related skills together (e.g., Java + Spring Boot + Maven)
- Each skill should appear in ONLY ONE category
- Limit total skills to 15-20 maximum (only include skills from the filtered list above)
- Categories should be ordered by relevance to job requirements
- Summary length (short = 2 sentences, medium = 3 sentences)

IMPORTANT: Group skills intelligently by technology domain, not just by priority. Create professional category names that make sense for HR and ATS systems.

Return structured JSON with skillGroups array containing 3-5 categories.`,
      {
        structuredOutput: {
          schema: CVStructureSchema,
        },
      }
    );

    const structure = structureResult.object;

    // Step 2: Content Agent - Write content for each section
    const contentAgent = mastra.getAgent("contentAgent");
    const contentResult = await contentAgent.generate(
      `Write concise, professional content for each CV section based on the structure decisions.

## Structure Decisions:
${JSON.stringify(structure, null, 2)}

## Full Profile Data:
${JSON.stringify(profileData, null, 2)}

## Job Requirements:
- Required Skills: ${JSON.stringify(jobRequirements.requiredSkills)}
- Preferred Skills: ${JSON.stringify(jobRequirements.preferredSkills)}
- Key Responsibilities: ${JSON.stringify(jobRequirements.keyResponsibilities)}

## Analysis Strengths:
${JSON.stringify(analysis.strengths, null, 2)}

## Experience Details (for structured output):
${scoredExperiences.map(scored => {
  const exp = scored.experience;
  const detailLevel = structure.experienceOrder.find(e => e.experienceId === exp.id)?.detailLevel || "brief";
  return `
Experience ID: ${exp.id}
Company: ${exp.company}
Position: ${exp.position}
Start Date: ${exp.startDate.toISOString().split('T')[0]}
End Date: ${exp.endDate ? exp.endDate.toISOString().split('T')[0] : null}
Current: ${exp.current}
Description: ${exp.description}
Detail Level: ${detailLevel}
Is Brief: ${detailLevel === "brief"}
`;
}).join("\n")}

## Skill Groups from Structure:
${structure.skillGroups.map((group, idx) => {
  const skillsInGroup = filteredSkills.filter(s => group.skillIds.includes(s.skill.id));
  return `
${idx + 1}. Category: ${group.category}
   Order: ${group.order}
   Skills in this category:
${skillsInGroup.map(scored => {
  const skill = scored.skill;
  const isRequired = jobRequirements.requiredSkills.some(r => r.toLowerCase() === skill.name.toLowerCase() || skill.name.toLowerCase().includes(r.toLowerCase()));
  const isPreferred = jobRequirements.preferredSkills.some(p => p.toLowerCase() === skill.name.toLowerCase() || skill.name.toLowerCase().includes(p.toLowerCase()));
  return `     - ${skill.name} (ID: ${skill.id}, Score: ${scored.score}, Bold: ${isRequired || isPreferred})`;
}).join("\n")}
`;
}).join("\n")}

Write structured content following these rules:

**EXPERIENCES:**
- For each experience in the Experience Details above, output a structured object:
  * company: Use the Company field exactly as shown
  * position: Use the Position field exactly as shown
  * startDate: Use the Start Date (ISO format YYYY-MM-DD)
  * endDate: Use End Date if present, or null if Current is true
  * current: Use the Current boolean value
  * achievements: 
    - If Detail Level is "detailed": Parse the Description field and extract achievements as an array of strings
    - If Detail Level is "brief" or Is Brief is true: Use empty array []
  * isBrief: Use the Is Brief value
- Extract achievements from the Description field by splitting into bullet points or key accomplishments
- Each achievement should be a plain text string (no markdown, no bullet points)
- Include quantifiable metrics and results when present

**SKILLS:**
- Skills must be grouped by categories from structure.skillGroups
- Each category should have 5-8 skills maximum
- Output skills as simple string arrays (no formatting, no markdown)
- Example: ["Java", "Spring Boot", "Spring", "Maven", "JUnit"]
- NO markdown formatting, NO bold, NO comma-separated strings
- Each skill should appear in ONLY ONE category
- Follow the skillGroups structure from structure decisions exactly

**SUMMARY:**
- 2-3 sentences tailored to job requirements, highlight key achievements
- Plain text string (no markdown, no formatting)

**EDUCATION (REQUIRED FIELD - MUST ALWAYS BE PRESENT):**
- Output structured array with institution, degree, fieldOfStudy, startDate, endDate, current, description
- Use data from Full Profile Data above
- **CRITICAL: This field is REQUIRED by the schema** - if no education data exists, output empty array []
- **DO NOT omit this field** - always include it, even if empty

**LANGUAGES (REQUIRED FIELD - MUST ALWAYS BE PRESENT):**
- Output structured array with name and proficiencyLevel
- Use data from Full Profile Data above
- **CRITICAL: This field is REQUIRED by the schema** - if no language data exists, output empty array []
- **DO NOT omit this field** - always include it, even if empty

Return structured JSON matching CVContentSchema (NO markdown, NO formatting, NO HTML).
**IMPORTANT: All fields including education and languages are REQUIRED - output empty arrays [] if no data exists.**`,
      {
        structuredOutput: {
          schema: CVContentSchema,
        },
      }
    );

    const content = contentResult.object;

    // Build structured CV data from structure and content
    // Determine role from most relevant experience or use a default
    const topExperience = scoredExperiences[0];
    const role = topExperience?.experience.position || "Software Engineer";

    const cvData: CVData = {
      header: {
        name: `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim(),
        role: role,
        location: profileData.location || profileData.city || profileData.country || null,
        email: profileData.email || null,
        phone: profileData.phone || null,
        imageUrl: profileData.profileImageUrl || null,
      },
      summary: content.summary,
      experiences: content.experiences.map(expContent => ({
        experienceId: expContent.experienceId,
        company: expContent.company,
        position: expContent.position,
        startDate: expContent.startDate,
        endDate: expContent.endDate,
        current: expContent.current,
        achievements: expContent.achievements,
        isBrief: expContent.isBrief,
      })),
      skillGroups: content.skillGroups.map(group => ({
        category: group.category,
        skills: group.skills, // Already an array of strings
      })),
      education: content.education || [], // Always an array (required by schema, can be empty)
      languages: content.languages || [], // Always an array (required by schema, can be empty)
    };

    // Validate the structured data
    const validatedData = CVDataSchema.parse(cvData);

    // Store structured CV data in database
    await prisma.generatedCV.update({
      where: { id: payload.cvId },
      data: {
        structuredContent: validatedData,
        status: "completed",
        completedAt: new Date(),
      },
    });

    return {
      cvId: cvRecord.id,
      structuredContent: validatedData,
    };
  },
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
  },
});
