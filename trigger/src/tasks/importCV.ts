import { task } from "@trigger.dev/sdk";
import { z } from "zod";
import { mastra } from "../lib/mastra";
import { bulkImportProfileData } from "../lib/utils/bulkImport";
import { extractTextFromPDF } from "../lib/utils/pdfExtractor";
import { extractTextFromMarkdown } from "../lib/utils/markdownExtractor";
import { ImportProfileDataSchema } from "../lib/types/schemas";
import type { ProfileData } from "../lib/types";

const payloadSchema = z.object({
  userId: z.string(),
  fileUrl: z.string(), // Public URL to the file
  fileContent: z.string().optional(), // Optional: direct text content for markdown files
  fileType: z.enum(["pdf", "markdown"]),
  fileName: z.string().optional(),
});

export const importCV = task({
  id: "import-cv",
  run: async (payload: z.infer<typeof payloadSchema>) => {
    try {
      // Validate payload
      if (!payload.userId) {
        throw new Error("userId is required");
      }
      if (!payload.fileUrl) {
        throw new Error("fileUrl is required");
      }
      if (!payload.fileType) {
        throw new Error("fileType is required");
      }

      const { userId, fileUrl, fileContent, fileType, fileName } = payload;

      console.log("Import CV payload:", {
        userId,
        fileUrl,
        fileType,
        fileName,
        hasFileContent: !!fileContent,
      });

      // Step 1: Extract text from file
      let cvText: string;
      
      if (fileType === "pdf") {
        // Validate URL
        if (!fileUrl || typeof fileUrl !== "string") {
          throw new Error(`Invalid fileUrl: ${fileUrl}`);
        }

        // Download PDF from URL and extract text
        const pdfResponse = await fetch(fileUrl);
        if (!pdfResponse.ok) {
          throw new Error(`Failed to download PDF from URL: ${pdfResponse.statusText}`);
        }
        
        const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
        cvText = await extractTextFromPDF(pdfBuffer);
      } else {
        // For markdown, use the provided content or fetch from URL
        if (fileContent) {
          cvText = await extractTextFromMarkdown(fileContent);
        } else {
          // Fallback: fetch from URL if content not provided
          const response = await fetch(fileUrl);
          const text = await response.text();
          cvText = await extractTextFromMarkdown(text);
        }
      }

      if (!cvText || cvText.trim().length === 0) {
        throw new Error("Failed to extract text from file or file is empty");
      }

      // Step 2: Use AI agent to extract structured data
      const importAgent = mastra.getAgent("importAgent");
      
      const extractionResult = await importAgent.generate(
        `Extract all information from this CV/resume document and output structured data matching the ImportProfileDataSchema.

CV Content:
${cvText}

CRITICAL EXTRACTION REQUIREMENTS:

**PERSONAL INFORMATION:**
- Extract name, email, phone, location, address, city, country, postal code, profile image URL, personal summary

**WORK EXPERIENCES:**
- Extract ALL work experiences with full details (company, position, dates, description)

**SKILLS - EXTREMELY IMPORTANT:**
- Extract EVERY skill mentioned anywhere in the document
- Look in: skills sections, work experience descriptions, project descriptions, education, summary, certifications
- Extract individual skills from lists (even if comma-separated or bullet points)
- Include: programming languages, frameworks, tools, technologies, platforms, databases, cloud services, methodologies, soft skills

ALLOWED ENUM VALUES (use these EXACT strings, do not invent variations):

- category: MUST be EXACTLY one of these 3 strings (copy them character-for-character):
  * "Programming Language" (exact string - for: Java, Python, JavaScript, TypeScript, C++, Go, Rust, PHP, Ruby, Swift, Kotlin, etc.)
  * "Technical" (exact string - for: React, Node.js, Docker, AWS, PostgreSQL, MySQL, MongoDB, Git, Kubernetes, Agile, Scrum, etc.)
  * "Soft Skills" (exact string - for: Communication, Leadership, Teamwork, Problem-solving, Time Management, etc.)
  FORBIDDEN: "Programming Languages", "Tech", "Technology", "Soft Skill", "Languages", or any other variation

- proficiencyLevel: MUST be EXACTLY one of these 4 strings OR null (copy them character-for-character):
  * "Expert" (exact string - for 5+ years or "expert in")
  * "Advanced" (exact string - for 3-4 years or "proficient in")
  * "Intermediate" (exact string - for 1-2 years or "familiar with")
  * "Beginner" (exact string - for less than 1 year or "learning")
  * null (if not mentioned)
  FORBIDDEN: "Proficient", "Skilled", "Novice", "Master", "Expertise", or any other variation

- DO NOT invent category or proficiency names - ONLY use the exact strings listed above
- DO NOT skip any skills - be exhaustive

**EDUCATION:**
- Extract ALL education entries with full details

**LANGUAGES:**
- Extract ALL languages with proficiency levels

Be extremely thorough - extract EVERY piece of information from the document.`,
        {
          structuredOutput: {
            schema: ImportProfileDataSchema,
          },
        }
      );

      const importData = extractionResult.object;

      // Convert import schema to profile data schema (with dates as Date objects)
      const profileData: ProfileData = {
        firstName: importData.firstName,
        lastName: importData.lastName,
        email: importData.email,
        phone: importData.phone,
        location: importData.location,
        address: importData.address,
        city: importData.city,
        country: importData.country,
        postalCode: importData.postalCode,
        profileImageUrl: importData.profileImageUrl,
        personalSummary: importData.personalSummary,
        workExperiences: importData.workExperiences.map((exp) => ({
          id: "", // Will be generated
          profileId: "", // Will be set during import
          company: exp.company,
          position: exp.position,
          startDate: new Date(exp.startDate),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          current: exp.current,
          description: exp.description,
          orderIndex: 0, // Will be set during import
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        skills: importData.skills.map((skill) => ({
          id: "", // Will be generated
          profileId: "", // Will be set during import
          name: skill.name,
          category: skill.category,
          proficiencyLevel: skill.proficiencyLevel,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        education: importData.education.map((edu) => ({
          id: "", // Will be generated
          profileId: "", // Will be set during import
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: new Date(edu.startDate),
          endDate: edu.endDate ? new Date(edu.endDate) : null,
          current: edu.current,
          description: edu.description,
          orderIndex: 0, // Will be set during import
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        languages: importData.languages.map((lang) => ({
          id: "", // Will be generated
          profileId: "", // Will be set during import
          name: lang.name,
          proficiencyLevel: lang.proficiencyLevel,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      // Step 3: Delete existing data and bulk import new data
      await bulkImportProfileData(userId, profileData);

      return {
        success: true,
        message: "CV imported successfully",
        importedData: {
          workExperiences: importData.workExperiences.length,
          skills: importData.skills.length,
          education: importData.education.length,
          languages: importData.languages.length,
        },
      };
    } catch (error) {
      console.error("Error importing CV:", error);
      throw new Error(
        `Failed to import CV: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
  retry: {
    maxAttempts: 2,
  },
});

