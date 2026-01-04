import type { WorkExperience } from "@/lib/types/prisma";
import type { Experience } from "./types";

/**
 * Converts a date (Date object or ISO string) to YYYY-MM-DD format
 */
function formatDateToISO(date: Date | string | null): string | null {
  if (!date) return null;
  
  // If it's already a string, try to extract the date part
  if (typeof date === "string") {
    // If it's already in YYYY-MM-DD format, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Otherwise, parse it and format
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toISOString().split("T")[0];
  }
  
  // If it's a Date object
  return date.toISOString().split("T")[0];
}

/**
 * Converts a WorkExperience from profile format to CV Experience format
 * Parses the description field into an achievements array
 * Handles dates that may be Date objects or ISO strings (from API serialization)
 */
export function transformWorkExperienceToCVExperience(
  workExp: WorkExperience
): Omit<Experience, "experienceId"> {
  // Parse description into achievements array
  // Handle various formats: newlines, bullet points, numbered lists
  const achievements = parseDescriptionToAchievements(workExp.description);

  return {
    company: workExp.company,
    position: workExp.position,
    startDate: formatDateToISO(workExp.startDate) || new Date().toISOString().split("T")[0],
    endDate: formatDateToISO(workExp.endDate),
    current: workExp.current,
    achievements,
    isBrief: false,
  };
}

/**
 * Parses a description string into an array of achievement strings
 * Handles:
 * - Newline-separated items
 * - Bullet points (•, -, *, etc.)
 * - Numbered lists
 * - Mixed formats
 */
function parseDescriptionToAchievements(description: string): string[] {
  if (!description || !description.trim()) {
    return [];
  }

  // Split by newlines first
  const lines = description.split(/\r?\n/);

  const achievements: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Remove common bullet point markers
    let cleaned = trimmed
      .replace(/^[•\-\*\+]\s+/, "") // Remove bullet points
      .replace(/^\d+[\.\)]\s+/, "") // Remove numbered list markers (1. or 1))
      .trim();

    // If the line still has content after cleaning, add it
    if (cleaned) {
      achievements.push(cleaned);
    }
  }

  // If no achievements were extracted (maybe it's a single paragraph),
  // return the original description as a single achievement
  if (achievements.length === 0 && description.trim()) {
    return [description.trim()];
  }

  return achievements;
}

/**
 * Checks if two experiences match by company and position
 */
export function experiencesMatch(
  exp1: { company: string; position: string },
  exp2: { company: string; position: string }
): boolean {
  const normalize = (str: string) => str.toLowerCase().trim();
  return (
    normalize(exp1.company) === normalize(exp2.company) &&
    normalize(exp1.position) === normalize(exp2.position)
  );
}

