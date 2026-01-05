import type { WorkExperience } from "@/lib/types/prisma";
import type { Experience } from "./types";

/**
 * Convert a Date or date-string to a `YYYY-MM-DD` date string.
 *
 * If `date` is `null`, returns `null`. If `date` is a string already in
 * `YYYY-MM-DD` form, it is returned unchanged. If `date` is a parsable
 * date string or a `Date` object, the function returns the corresponding
 * `YYYY-MM-DD` representation. If a string cannot be parsed as a valid
 * date, returns `null`.
 *
 * @param date - The input value to convert; may be a `Date`, a date string, or `null`
 * @returns The date in `YYYY-MM-DD` format, or `null` when input is `null` or invalid
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
 * Map a profile WorkExperience into a CV-friendly Experience object.
 *
 * @param workExp - Work experience record from the profile containing `company`, `position`, `startDate`, `endDate`, `current`, and `description`
 * @returns An object with `company`, `position`, `startDate` (YYYY-MM-DD), `endDate` (YYYY-MM-DD or `null`), `current`, `achievements` (parsed from `description`), and `isBrief` set to `false`
 * @throws {Error} If `startDate` is missing or cannot be parsed as a valid date. The error message includes the company, position, and raw startDate value for debugging.
 */
export function transformWorkExperienceToCVExperience(
  workExp: WorkExperience
): Omit<Experience, "experienceId"> {
  // Parse description into achievements array
  // Handle various formats: newlines, bullet points, numbered lists
  const achievements = parseDescriptionToAchievements(workExp.description);

  // Validate startDate - throw error if invalid instead of silently falling back
  const formattedStartDate = formatDateToISO(workExp.startDate);
  if (!formattedStartDate) {
    throw new Error(
      `Invalid startDate for work experience: company="${workExp.company}", position="${workExp.position}", startDate=${JSON.stringify(workExp.startDate)}`
    );
  }

  return {
    company: workExp.company,
    position: workExp.position,
    startDate: formattedStartDate,
    endDate: formatDateToISO(workExp.endDate),
    current: workExp.current,
    achievements,
    isBrief: false,
  };
}

/**
 * Convert a free-form description into a list of individual achievement strings.
 *
 * @param description - The raw description text (may contain newlines, bullets, or numbered lists)
 * @returns An array of trimmed achievement strings; returns an empty array if `description` is empty or only whitespace. If no distinct lines or markers are detected, returns a single-element array containing the trimmed original `description`.
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
 * Determine whether two experiences refer to the same role based on company and position.
 *
 * @returns `true` if both company and position are equal after trimming and case-insensitive comparison, `false` otherwise.
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
