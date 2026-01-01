import { task } from "@trigger.dev/sdk";
import { z } from "zod";
import { mastra } from "../lib/mastra";
import { prisma } from "../lib/prisma/client";
import { fetchProfileData } from "../lib/utils/profile";

const payloadSchema = z.object({
  userId: z.string(),
  jobDescriptionId: z.string(),
  analysisResultId: z.string().optional(),
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

    // Fetch profile data
    const profileData = await fetchProfileData(payload.userId);

    // Get the CV generation agent
    const agent = mastra.getAgent("cvGenerationAgent");

    // Step 1: Extract relevant experience (optional - can be done by agent)
    // For now, we'll let the agent handle this internally

    // Step 2: Generate CV content
    const cvResult = await agent.generate(
      `Generate a tailored CV in Markdown format based on this profile data and job description.

Profile Data:
${JSON.stringify(profileData, null, 2)}

Job Description:
${payload.jobDescription}

Instructions:
- Generate a professional, well-structured CV in Markdown format
- Tailor the content to highlight experiences and skills relevant to the job description
- Include sections: Header (name, contact info), Summary, Experience, Skills, Education, Languages
- Only include information that exists in the profile data
- Do not invent or add any information not in the profile
- If a section has no data in the profile, omit that section entirely
- Use professional, clear language
- Format as clean Markdown with proper headings and structure

IMPORTANT: Return ONLY the raw Markdown content. Do NOT wrap it in code blocks (no \`\`\`markdown or \`\`\`). Return the Markdown text directly.`
    );

    // Clean the markdown content - remove code block wrapper if present
    let markdownContent = cvResult.text.trim();
    // Remove markdown code block wrapper (```markdown ... ``` or ``` ... ```)
    markdownContent = markdownContent
      .replace(/^```markdown\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/g, "")
      .trim();

    // Step 3: Validate CV content (basic check - can be enhanced)
    // For now, we'll store the CV. Advanced validation can be added later if needed.

    // Store CV in database
    await prisma.generatedCV.update({
      where: { id: payload.cvId },
      data: {
        markdownContent,
        status: "completed",
        completedAt: new Date(),
      },
    });

    return {
      cvId: cvRecord.id,
      markdownContent,
    };
  },
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
  },
});
