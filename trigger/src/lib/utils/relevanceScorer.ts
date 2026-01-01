import type { WorkExperience, Skill, JobRequirements } from "../types";

export interface ScoredWorkExperience {
  experience: WorkExperience;
  score: number;
  reasons: string[];
}

export interface ScoredSkill {
  skill: Skill;
  score: number;
  category: "required" | "preferred" | "related" | "other";
  reasons: string[];
}

/**
 * Scores a work experience based on its relevance to job requirements.
 * Higher scores indicate more relevance.
 */
function scoreWorkExperience(
  experience: WorkExperience,
  requirements: JobRequirements
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  const experienceText = `${experience.position} ${experience.company} ${experience.description}`.toLowerCase();
  const requiredSkillsLower = requirements.requiredSkills.map(s => s.toLowerCase());
  const preferredSkillsLower = requirements.preferredSkills.map(s => s.toLowerCase());
  const responsibilitiesLower = requirements.keyResponsibilities.map(r => r.toLowerCase());
  
  // Check for required skills mentioned in experience
  for (const skill of requiredSkillsLower) {
    if (experienceText.includes(skill)) {
      score += 10;
      reasons.push(`Mentions required skill: ${skill}`);
    }
  }
  
  // Check for preferred skills mentioned in experience
  for (const skill of preferredSkillsLower) {
    if (experienceText.includes(skill)) {
      score += 5;
      reasons.push(`Mentions preferred skill: ${skill}`);
    }
  }
  
  // Check for key responsibilities mentioned
  for (const responsibility of responsibilitiesLower) {
    const keywords = responsibility.split(/\s+/).filter(w => w.length > 3);
    const matches = keywords.filter(keyword => experienceText.includes(keyword));
    if (matches.length > 0) {
      score += 8;
      reasons.push(`Matches responsibility: ${responsibility.substring(0, 50)}...`);
    }
  }
  
  // Boost score for current/recent positions
  if (experience.current) {
    score += 3;
    reasons.push("Current position");
  } else if (experience.endDate) {
    const yearsSince = (new Date().getTime() - experience.endDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (yearsSince < 2) {
      score += 2;
      reasons.push("Recent position (within 2 years)");
    }
  }
  
  return { score, reasons };
}

/**
 * Scores all work experiences and returns them sorted by relevance (highest first).
 * All experiences are included, just sorted by relevance.
 */
export function scoreAndSortWorkExperiences(
  experiences: WorkExperience[],
  requirements: JobRequirements
): ScoredWorkExperience[] {
  const scored = experiences.map(experience => {
    const { score, reasons } = scoreWorkExperience(experience, requirements);
    return {
      experience,
      score,
      reasons,
    };
  });
  
  // Sort by score (highest first), then by orderIndex for stable sorting
  return scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.experience.orderIndex - b.experience.orderIndex;
  });
}

/**
 * Scores a skill based on job requirements.
 */
function scoreSkill(
  skill: Skill,
  requiredSkills: string[],
  preferredSkills: string[],
  relatedSkills: Skill[]
): { score: number; category: "required" | "preferred" | "related" | "other"; reasons: string[] } {
  const skillNameLower = skill.name.toLowerCase();
  const requiredLower = requiredSkills.map(s => s.toLowerCase());
  const preferredLower = preferredSkills.map(s => s.toLowerCase());
  const relatedLower = relatedSkills.map(s => s.name.toLowerCase());
  
  // Check if it's a required skill
  for (const required of requiredLower) {
    if (skillNameLower === required || skillNameLower.includes(required) || required.includes(skillNameLower)) {
      let score = 20;
      // Boost score if proficiency level is high
      if (skill.proficiencyLevel) {
        const proficiency = skill.proficiencyLevel.toLowerCase();
        if (proficiency.includes("expert") || proficiency.includes("advanced") || proficiency.includes("senior")) {
          score += 5;
        }
      }
      return {
        score,
        category: "required",
        reasons: ["Required skill for the job"],
      };
    }
  }
  
  // Check if it's a preferred skill
  for (const preferred of preferredLower) {
    if (skillNameLower === preferred || skillNameLower.includes(preferred) || preferred.includes(skillNameLower)) {
      let score = 10;
      if (skill.proficiencyLevel) {
        const proficiency = skill.proficiencyLevel.toLowerCase();
        if (proficiency.includes("expert") || proficiency.includes("advanced") || proficiency.includes("senior")) {
          score += 3;
        }
      }
      return {
        score,
        category: "preferred",
        reasons: ["Preferred skill for the job"],
      };
    }
  }
  
  // Check if it's a related skill (expanded from required skills)
  for (const related of relatedLower) {
    if (skillNameLower === related || skillNameLower.includes(related) || related.includes(skillNameLower)) {
      return {
        score: 8,
        category: "related",
        reasons: ["Related to required skills"],
      };
    }
  }
  
  // Other skill
  return {
    score: 1,
    category: "other",
    reasons: ["Not directly mentioned in job requirements"],
  };
}

/**
 * Scores all skills and returns them sorted by relevance (highest first).
 * All skills are included, just sorted by relevance.
 */
export function scoreAndSortSkills(
  skills: Skill[],
  requiredSkills: string[],
  preferredSkills: string[],
  relatedSkills: Skill[]
): ScoredSkill[] {
  const scored = skills.map(skill => {
    const { score, category, reasons } = scoreSkill(skill, requiredSkills, preferredSkills, relatedSkills);
    return {
      skill,
      score,
      category,
      reasons,
    };
  });
  
  // Sort by score (highest first), then alphabetically for stable sorting
  return scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.skill.name.localeCompare(b.skill.name);
  });
}

/**
 * Filters skills by relevance threshold and limits to top N skills.
 * This ensures only the most relevant skills are shown in the CV.
 * 
 * @param scoredSkills - Array of scored skills (should be pre-sorted by relevance)
 * @param minScore - Minimum score threshold (default: 5) - skills below this are filtered out
 * @param maxSkills - Maximum number of skills to return (default: 20)
 * @returns Filtered and limited array of scored skills
 */
export function filterSkillsByRelevance(
  scoredSkills: ScoredSkill[],
  minScore: number = 5,
  maxSkills: number = 20
): ScoredSkill[] {
  // Filter by minimum score threshold
  const filtered = scoredSkills.filter(scored => scored.score >= minScore);
  
  // Limit to top N skills
  return filtered.slice(0, maxSkills);
}

