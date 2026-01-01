// Analysis-related types
import type { AnalysisResult } from "./prisma";

export interface AnalysisStrength {
  title: string;
  description: string;
}

export interface AnalysisGap {
  title: string;
  description: string;
  severity: string;
}

export type MissingSkill = 
  | string 
  | {
      name: string;
      type: "technical" | "soft-skill" | "programming-language";
    };

export interface AnalysisResultData {
  id: string;
  matchScore: number;
  strengths: AnalysisStrength[];
  gaps: AnalysisGap[];
  missingSkills: MissingSkill[];
  suggestedFocusAreas: string[];
  status: string;
  jobRequirements?: {
    requiredSkills?: string[];
    preferredSkills?: string[];
    [key: string]: unknown;
  } | null;
}

export type AnalysisResultWithData = AnalysisResult & {
  strengths: AnalysisStrength[];
  gaps: AnalysisGap[];
  missingSkills: MissingSkill[];
  suggestedFocusAreas: string[];
  jobRequirements?: AnalysisResultData["jobRequirements"];
};

