import { analysisAgent } from "../mastra/agents/analysisAgent";
import { cvGenerationAgent } from "../mastra/agents/cvGenerationAgent";
import type { JobRequirements } from "../types";
import type { RelevantExperience, ProfileData } from "../types";
import { jobRequirementsCache, relevantExperienceCache, getJobRequirementsCacheKey, getRelevantExperienceCacheKey } from "./cache";

/**
 * Uses LLM to extract structured job requirements from a job description
 * Results are cached to avoid redundant LLM calls for the same job description
 */
export async function extractJobRequirementsWithLLM(jobDescription: string): Promise<JobRequirements> {
  // Check cache first
  const cacheKey = getJobRequirementsCacheKey(jobDescription);
  const cached = jobRequirementsCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const prompt = `Extract structured requirements from this job description. Return ONLY valid JSON with this exact structure:
{
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill3", "skill4"],
  "qualifications": ["qualification1", "qualification2"],
  "experienceLevel": "entry-level" | "mid-level" | "senior" | "executive",
  "keyResponsibilities": ["responsibility1", "responsibility2"]
}

Job Description:
${jobDescription}

Return only the JSON object, no markdown formatting or additional text.`;

  try {
    const agentResult = await analysisAgent.generate(prompt);
    const jsonText = agentResult.text.trim();
    // Remove markdown code blocks if present
    const cleanedText = jsonText.replace(/^```json\s*|\s*```$/g, "").replace(/^```\s*|\s*```$/g, "").trim();
    const parsed = JSON.parse(cleanedText) as JobRequirements;
    
    // Validate and ensure all fields exist
    const jobRequirements = {
      requiredSkills: parsed.requiredSkills || [],
      preferredSkills: parsed.preferredSkills || [],
      qualifications: parsed.qualifications || [],
      experienceLevel: parsed.experienceLevel || "",
      keyResponsibilities: parsed.keyResponsibilities || [],
    };
    
    // Cache the result
    jobRequirementsCache.set(cacheKey, jobRequirements);
    return jobRequirements;
  } catch (error) {
    console.error("Error extracting job requirements with LLM:", error);
    // Fallback to empty structure
    const fallback = {
      requiredSkills: [],
      preferredSkills: [],
      qualifications: [],
      experienceLevel: "",
      keyResponsibilities: [],
    };
    // Don't cache errors, but cache fallback to avoid repeated failures
    jobRequirementsCache.set(cacheKey, fallback, 60000); // Cache for 1 minute only
    return fallback;
  }
}

/**
 * Uses LLM to identify relevant experiences, skills, and education from profile
 * Results are cached to avoid redundant LLM calls for the same profile + job combination
 */
export async function extractRelevantExperienceWithLLM(
  profileData: ProfileData,
  jobDescription: string
): Promise<RelevantExperience> {
  // Use profile ID or first work experience ID as profile identifier for cache
  const profileId = profileData.workExperiences[0]?.id || "default";
  const cacheKey = getRelevantExperienceCacheKey(profileId, jobDescription);
  const cached = relevantExperienceCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const prompt = `Analyze this profile and job description to identify the most relevant experiences, skills, and education.

Profile Data:
- Work Experiences: ${JSON.stringify(profileData.workExperiences.map(exp => ({
  id: exp.id,
  company: exp.company,
  position: exp.position,
  description: exp.description
})))}
- Skills: ${JSON.stringify(profileData.skills.map(s => ({ id: s.id, name: s.name })))}
- Education: ${JSON.stringify(profileData.education.map(edu => ({
  id: edu.id,
  institution: edu.institution,
  degree: edu.degree,
  fieldOfStudy: edu.fieldOfStudy
})))}

Job Description:
${jobDescription}

Return ONLY valid JSON with this exact structure:
{
  "relevantExperiences": ["experience-id-1", "experience-id-2"],
  "relevantSkills": ["skill-name-1", "skill-name-2"],
  "relevantEducation": ["education-id-1", "education-id-2"]
}

Include only IDs/names that are genuinely relevant to the job. Return only the JSON object, no markdown formatting.`;

  try {
    const agentResult = await cvGenerationAgent.generate(prompt);
    const jsonText = agentResult.text.trim();
    // Remove markdown code blocks if present
    const cleanedText = jsonText.replace(/^```json\s*|\s*```$/g, "").replace(/^```\s*|\s*```$/g, "").trim();
    const parsed = JSON.parse(cleanedText) as RelevantExperience;
    
    const relevantExperience = {
      relevantExperiences: parsed.relevantExperiences || [],
      relevantSkills: parsed.relevantSkills || [],
      relevantEducation: parsed.relevantEducation || [],
    };
    
    // Cache the result
    relevantExperienceCache.set(cacheKey, relevantExperience);
    return relevantExperience;
  } catch (error) {
    console.error("Error extracting relevant experience with LLM:", error);
    // Fallback to empty structure
    const fallback = {
      relevantExperiences: [],
      relevantSkills: [],
      relevantEducation: [],
    };
    // Don't cache errors, but cache fallback to avoid repeated failures
    relevantExperienceCache.set(cacheKey, fallback, 60000); // Cache for 1 minute only
    return fallback;
  }
}

/**
 * Uses LLM to calculate a more accurate match score with semantic analysis
 */
export async function calculateMatchScoreWithLLM(
  profileData: ProfileData,
  requirements: { requiredSkills: string[]; preferredSkills: string[]; qualifications: string[] }
): Promise<{ matchScore: number; breakdown: { skillsMatch: number; experienceMatch: number; educationMatch: number } }> {
  const prompt = `Calculate a detailed match score between this profile and job requirements.

Profile:
- Skills: ${JSON.stringify(profileData.skills.map(s => s.name))}
- Work Experiences: ${profileData.workExperiences.length} positions
- Education: ${JSON.stringify(profileData.education.map(e => `${e.degree} in ${e.fieldOfStudy || "N/A"}`))}

Job Requirements:
- Required Skills: ${JSON.stringify(requirements.requiredSkills)}
- Preferred Skills: ${JSON.stringify(requirements.preferredSkills)}
- Qualifications: ${JSON.stringify(requirements.qualifications)}

Return ONLY valid JSON with this exact structure:
{
  "matchScore": 0-100,
  "breakdown": {
    "skillsMatch": 0-100,
    "experienceMatch": 0-100,
    "educationMatch": 0-100
  }
}

Be accurate and consider semantic similarity, not just exact matches. Return only the JSON object.`;

  try {
    const result = await analysisAgent.generate(prompt);
    const jsonText = result.text.trim();
    const cleanedText = jsonText.replace(/^```json\s*|\s*```$/g, "").replace(/^```\s*|\s*```$/g, "").trim();
    const parsed = JSON.parse(cleanedText) as { matchScore: number; breakdown: { skillsMatch: number; experienceMatch: number; educationMatch: number } };
    
    return {
      matchScore: Math.min(100, Math.max(0, parsed.matchScore || 0)),
      breakdown: {
        skillsMatch: Math.min(100, Math.max(0, parsed.breakdown?.skillsMatch || 0)),
        experienceMatch: Math.min(100, Math.max(0, parsed.breakdown?.experienceMatch || 0)),
        educationMatch: Math.min(100, Math.max(0, parsed.breakdown?.educationMatch || 0)),
      },
    };
  } catch (error) {
    console.error("Error calculating match score with LLM:", error);
    // Fallback to basic calculation
    return {
      matchScore: 50,
      breakdown: {
        skillsMatch: 50,
        experienceMatch: 50,
        educationMatch: 50,
      },
    };
  }
}

