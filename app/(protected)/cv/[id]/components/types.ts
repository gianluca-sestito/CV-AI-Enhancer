// Shared CV data types (matching backend CVDataSchema)
// These types are shared between backend and frontend

export interface CVHeader {
  name: string;
  role: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  imageUrl: string | null;
}

export interface Experience {
  experienceId: string;
  company: string;
  position: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string | null; // ISO date string or null for current
  current: boolean;
  achievements: string[]; // Array of achievement strings
  isBrief: boolean; // If true, only show company/position/dates
}

export interface SkillGroup {
  category: string;
  skills: string[]; // Array of skill names
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
  startDate: string; // ISO date string
  endDate: string | null; // ISO date string or null for current
  current: boolean;
  description: string | null;
}

export interface Language {
  name: string;
  proficiencyLevel: string; // e.g., "Native", "Fluent", "Intermediate", "Basic"
}

export interface CVData {
  header: CVHeader;
  summary: string;
  experiences: Experience[];
  skillGroups: SkillGroup[];
  education: Education[]; // Required but can be empty array
  languages: Language[]; // Required but can be empty array
}

// Style types
export interface ElementStyles {
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  lineHeight?: string;
  marginTop?: string;
  marginBottom?: string;
  padding?: string;
}

export interface SectionStyles {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  marginTop?: string;
  marginBottom?: string;
  padding?: string;
  spacing?: string;
}

export interface CVStyles {
  global: {
    fontFamily: string;
    baseFontSize: string;
    lineHeight: string;
    textColor: string;
    backgroundColor: string;
    primaryColor: string;
    secondaryColor: string;
    borderColor: string;
    baseSpacing: string;
    sectionSpacing: string;
  };
  sections: {
    header: SectionStyles;
    summary: SectionStyles;
    experience: SectionStyles;
    skills: SectionStyles;
    education: SectionStyles;
    languages: SectionStyles;
  };
  elements: {
    h1: ElementStyles;
    h2: ElementStyles;
    h3: ElementStyles;
    p: ElementStyles;
    badge: ElementStyles;
    listItem: ElementStyles;
  };
}
