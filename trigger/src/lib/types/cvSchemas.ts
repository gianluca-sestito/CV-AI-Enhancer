import { z } from "zod";

// CV Structure Schema - Output from Structure Agent
export const ExperienceOrderItemSchema = z.object({
  experienceId: z.string(),
  relevanceScore: z.number(),
  detailLevel: z.enum(["detailed", "brief"]), // detailed = full description, brief = company/position/dates only
  order: z.number(),
});

export const SkillGroupSchema = z.object({
  category: z.string(), // e.g., "Backend Technologies", "Cloud Platforms", "AI/ML Tools"
  skillIds: z.array(z.string()), // Skill IDs in this category
  order: z.number(), // Order of this category (higher = more important)
});

export const CVStructureSchema = z.object({
  sections: z.object({
    header: z.boolean(),
    summary: z.boolean(),
    skills: z.boolean(),
    experience: z.boolean(),
    education: z.boolean(),
    languages: z.boolean(),
    contact: z.boolean(),
  }),
  sectionOrder: z.array(z.string()), // Order of sections
  experienceOrder: z.array(ExperienceOrderItemSchema),
  skillGroups: z.array(SkillGroupSchema), // Skills grouped by technology categories (3-5 groups max)
  maxSkillsToShow: z.number().min(10).max(25), // Limit total skills shown (top 15-20, typically 20)
  summaryLength: z.enum(["short", "medium"]), // short = 2 sentences, medium = 3 sentences
});

// CV Content Schema - Output from Content Agent (structured data, not markdown)
export const SkillGroupContentSchema = z.object({
  category: z.string(), // Category name (e.g., "Backend Technologies")
  skills: z.array(z.string()), // Array of skill names (no IDs, no bold flags - frontend handles styling)
});

export const ExperienceContentSchema = z.object({
  experienceId: z.string(),
  company: z.string(),
  position: z.string(),
  startDate: z.string(), // ISO date string
  endDate: z.string().nullable(), // ISO date string or null for current
  current: z.boolean(),
  achievements: z.array(z.string()), // Array of achievement strings (no markdown)
  isBrief: z.boolean(), // If true, only show company/position/dates
});

export const EducationContentSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string().nullable(),
  startDate: z.string(), // ISO date string
  endDate: z.string().nullable(), // ISO date string or null for current
  current: z.boolean(),
  description: z.string().nullable(),
});

export const LanguageContentSchema = z.object({
  name: z.string(),
  proficiencyLevel: z.string(), // e.g., "Native", "Fluent", "Intermediate", "Basic"
});

export const CVContentSchema = z.object({
  summary: z.string(), // 2-3 sentences tailored summary (plain text, no markdown)
  skillGroups: z.array(SkillGroupContentSchema), // Skills grouped by categories from structure
  experiences: z.array(ExperienceContentSchema), // Structured experience data
  education: z.array(EducationContentSchema), // Structured education data (empty array if none) - REQUIRED for OpenAI schema
  languages: z.array(LanguageContentSchema), // Structured language data (empty array if none) - REQUIRED for OpenAI schema
});

// CV Data Schema - Final structured CV data (matches frontend component structure)
export const CVHeaderSchema = z.object({
  name: z.string(), // Full name
  role: z.string().nullable(), // Job title/role
  location: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  imageUrl: z.string().nullable(),
});

export const CVDataSchema = z.object({
  header: CVHeaderSchema,
  summary: z.string(),
  experiences: z.array(ExperienceContentSchema),
  skillGroups: z.array(SkillGroupContentSchema),
  education: z.array(EducationContentSchema), // Required but can be empty array
  languages: z.array(LanguageContentSchema), // Required but can be empty array
});

// Type exports
export type CVStructure = z.infer<typeof CVStructureSchema>;
export type CVContent = z.infer<typeof CVContentSchema>;
export type CVData = z.infer<typeof CVDataSchema>;
export type CVHeader = z.infer<typeof CVHeaderSchema>;
export type ExperienceOrderItem = z.infer<typeof ExperienceOrderItemSchema>;
export type SkillGroup = z.infer<typeof SkillGroupSchema>;
export type SkillGroupContent = z.infer<typeof SkillGroupContentSchema>;
export type ExperienceContent = z.infer<typeof ExperienceContentSchema>;
export type EducationContent = z.infer<typeof EducationContentSchema>;
export type LanguageContent = z.infer<typeof LanguageContentSchema>;

