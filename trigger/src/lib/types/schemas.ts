import { z } from "zod";

// Profile-related schemas
export const WorkExperienceSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  company: z.string(),
  position: z.string(),
  startDate: z.date(),
  endDate: z.date().nullable(),
  current: z.boolean(),
  description: z.string(),
  orderIndex: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SkillSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  name: z.string(),
  category: z.string().nullable(),
  proficiencyLevel: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EducationSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  institution: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string().nullable(),
  startDate: z.date(),
  endDate: z.date().nullable(),
  current: z.boolean(),
  description: z.string().nullable(),
  orderIndex: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LanguageSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  name: z.string(),
  proficiencyLevel: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProfileDataSchema = z.object({
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
  workExperiences: z.array(WorkExperienceSchema),
  skills: z.array(SkillSchema),
  education: z.array(EducationSchema),
  languages: z.array(LanguageSchema),
});

// Analysis-related schemas
export const StrengthSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const GapSchema = z.object({
  title: z.string(),
  description: z.string(),
  severity: z.enum(["low", "medium", "high"]),
});

export const AnalysisOutputSchema = z.object({
  matchScore: z.number().min(0).max(100),
  strengths: z.array(StrengthSchema),
  gaps: z.array(GapSchema),
  missingSkills: z.array(z.string()),
  suggestedFocusAreas: z.array(z.string()),
});

// Job requirements schemas
export const JobRequirementsSchema = z.object({
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  qualifications: z.array(z.string()),
  experienceLevel: z.string(),
  keyResponsibilities: z.array(z.string()),
});

// Relevant experience schemas
export const RelevantExperienceSchema = z.object({
  relevantExperiences: z.array(z.string()),
  relevantSkills: z.array(z.string()),
  relevantEducation: z.array(z.string()),
});

// Match score breakdown schema
export const MatchScoreBreakdownSchema = z.object({
  skillsMatch: z.number(),
  experienceMatch: z.number(),
  educationMatch: z.number(),
});

export const MatchScoreOutputSchema = z.object({
  matchScore: z.number().min(0).max(100),
  breakdown: MatchScoreBreakdownSchema,
});

// Validation schemas
export const ProfileValidationSchema = z.object({
  isValid: z.boolean(),
  missingFields: z.array(z.string()),
  warnings: z.array(z.string()),
});

export const CVValidationSchema = z.object({
  isValid: z.boolean(),
  violations: z.array(z.string()),
  warnings: z.array(z.string()),
});


