import { z } from "zod";
import {
  ProfileDataSchema,
  WorkExperienceSchema,
  SkillSchema,
  EducationSchema,
  LanguageSchema,
  AnalysisOutputSchema,
  StrengthSchema,
  GapSchema,
  JobRequirementsSchema,
  RelevantExperienceSchema,
  MatchScoreOutputSchema,
  ProfileValidationSchema,
  CVValidationSchema,
} from "./schemas";
import {
  CVStructureSchema,
  CVContentSchema,
  CVFormatSchema,
  type CVStructure,
  type CVContent,
  type CVFormat,
} from "./cvSchemas";

// TypeScript types derived from Zod schemas
export type ProfileData = z.infer<typeof ProfileDataSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>;
export type Strength = z.infer<typeof StrengthSchema>;
export type Gap = z.infer<typeof GapSchema>;
export type JobRequirements = z.infer<typeof JobRequirementsSchema>;
export type RelevantExperience = z.infer<typeof RelevantExperienceSchema>;
export type MatchScoreOutput = z.infer<typeof MatchScoreOutputSchema>;
export type ProfileValidation = z.infer<typeof ProfileValidationSchema>;
export type CVValidation = z.infer<typeof CVValidationSchema>;

// Re-export schemas for use in workflows and tools
export {
  ProfileDataSchema,
  WorkExperienceSchema,
  SkillSchema,
  EducationSchema,
  LanguageSchema,
  AnalysisOutputSchema,
  StrengthSchema,
  GapSchema,
  JobRequirementsSchema,
  RelevantExperienceSchema,
  MatchScoreOutputSchema,
  ProfileValidationSchema,
  CVValidationSchema,
  CVStructureSchema,
  CVContentSchema,
  CVFormatSchema,
};

// Re-export CV types
export type { CVStructure, CVContent, CVFormat };



