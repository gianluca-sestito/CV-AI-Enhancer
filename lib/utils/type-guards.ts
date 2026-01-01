// Type guards for runtime type checking
import type { Prisma } from "@prisma/client";
import type { AnalysisResultData, AnalysisStrength, AnalysisGap, MissingSkill } from "@/lib/types/analysis";

/**
 * Type guard to check if a value is an array of AnalysisStrength
 */
export function isAnalysisStrengths(value: unknown): value is AnalysisStrength[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "title" in item &&
      "description" in item &&
      typeof item.title === "string" &&
      typeof item.description === "string"
  );
}

/**
 * Type guard to check if a value is an array of AnalysisGap
 */
export function isAnalysisGaps(value: unknown): value is AnalysisGap[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "title" in item &&
      "description" in item &&
      "severity" in item &&
      typeof item.title === "string" &&
      typeof item.description === "string" &&
      typeof item.severity === "string"
  );
}

/**
 * Type guard to check if a value is an array of strings
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/**
 * Type guard to check if a value is a MissingSkill array
 */
export function isMissingSkills(value: unknown): value is MissingSkill[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      typeof item === "string" ||
      (typeof item === "object" &&
        item !== null &&
        "name" in item &&
        "type" in item &&
        typeof item.name === "string" &&
        typeof item.type === "string")
  );
}

/**
 * Safely parse JSON from Prisma JsonValue
 */
export function parseJsonValue<T>(value: Prisma.JsonValue, fallback: T): T {
  if (value === null || value === undefined) {
    return fallback;
  }
  return value as T;
}

/**
 * Parse analysis result JSON fields with type safety
 */
export function parseAnalysisResult(analysis: {
  strengths: Prisma.JsonValue;
  gaps: Prisma.JsonValue;
  missingSkills: Prisma.JsonValue;
  suggestedFocusAreas: Prisma.JsonValue;
  jobRequirements?: Prisma.JsonValue | null;
}): AnalysisResultData {
  return {
    id: "",
    matchScore: 0,
    strengths: isAnalysisStrengths(analysis.strengths) ? analysis.strengths : [],
    gaps: isAnalysisGaps(analysis.gaps) ? analysis.gaps : [],
    missingSkills: isMissingSkills(analysis.missingSkills) ? analysis.missingSkills : [],
    suggestedFocusAreas: isStringArray(analysis.suggestedFocusAreas) ? analysis.suggestedFocusAreas : [],
    status: "",
    jobRequirements: analysis.jobRequirements
      ? (analysis.jobRequirements as AnalysisResultData["jobRequirements"])
      : null,
  };
}

