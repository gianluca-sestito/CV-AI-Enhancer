// CV-related types - shared between frontend and backend
export type {
  CVHeader,
  Experience as CVExperience,
  SkillGroup,
  Education as CVEducation,
  Language as CVLanguage,
  CVData,
  ElementStyles,
  SectionStyles,
  CVStyles,
} from "@/app/(protected)/cv/[id]/components/types";

// Re-export for convenience
export type { CVData as CVStructuredContent } from "@/app/(protected)/cv/[id]/components/types";

