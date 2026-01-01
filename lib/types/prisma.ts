// Re-export Prisma types for use throughout the application
export type {
  Profile,
  WorkExperience,
  Skill,
  Education,
  Language,
  JobDescription,
  AnalysisResult,
  GeneratedCV,
} from "@prisma/client";

// Type helpers for Prisma includes
import type { Prisma } from "@prisma/client";

export type ProfileWithRelations = Prisma.ProfileGetPayload<{
  include: {
    workExperiences: true;
    skills: true;
    education: true;
    languages: true;
  };
}>;

export type JobDescriptionWithRelations = Prisma.JobDescriptionGetPayload<{
  include: {
    analysisResults: true;
    generatedCVs: true;
  };
}>;

export type GeneratedCVWithRelations = Prisma.GeneratedCVGetPayload<{
  include: {
    jobDescription: true;
    analysisResult: true;
  };
}>;

export type AnalysisResultWithRelations = Prisma.AnalysisResultGetPayload<{
  include: {
    jobDescription: true;
    generatedCVs: true;
  };
}>;

