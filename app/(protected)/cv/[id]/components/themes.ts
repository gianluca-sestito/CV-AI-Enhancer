import { logger } from "@/lib/utils/logger";

export type ThemeName = "modern" | "classic" | "minimal" | "professional";

export interface Theme {
  name: string;
  fontFamily: {
    body: string;
    heading: string;
  };
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
  };
  spacing: {
    base: string;
    heading: string;
    section: string;
  };
  fontSize: {
    base: string;
    heading: string;
    small: string;
  };
}

export const themes: Record<ThemeName, Theme> = {
  modern: {
    name: "Modern",
    fontFamily: {
      body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif",
      heading: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif",
    },
    colors: {
      primary: "#1a1a1a",
      secondary: "#6b7280",
      background: "#ffffff",
      text: "#1a1a1a",
      border: "#e5e7eb",
    },
    spacing: {
      base: "1rem",
      heading: "1.25rem",
      section: "1.5rem",
    },
    fontSize: {
      base: "1rem",
      heading: "1.25rem",
      small: "0.875rem",
    },
  },
  classic: {
    name: "Classic",
    fontFamily: {
      body: "'Georgia', 'Times New Roman', serif",
      heading: "'Georgia', 'Times New Roman', serif",
    },
    colors: {
      primary: "#3d2817",
      secondary: "#6b4e3d",
      background: "#faf9f6",
      text: "#3d2817",
      border: "#d4c4b0",
    },
    spacing: {
      base: "1rem",
      heading: "1.5rem",
      section: "2rem",
    },
    fontSize: {
      base: "1rem",
      heading: "1.5rem",
      small: "0.875rem",
    },
  },
  minimal: {
    name: "Minimal",
    fontFamily: {
      body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif",
      heading: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif",
    },
    colors: {
      primary: "#1a1a1a",
      secondary: "#6b7280",
      background: "#ffffff",
      text: "#1a1a1a",
      border: "#f3f4f6",
    },
    spacing: {
      base: "0.75rem",
      heading: "1rem",
      section: "1.25rem",
    },
    fontSize: {
      base: "0.9375rem",
      heading: "1.125rem",
      small: "0.8125rem",
    },
  },
  professional: {
    name: "Professional",
    fontFamily: {
      body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif",
      heading: "'Georgia', 'Times New Roman', serif",
    },
    colors: {
      primary: "#1e40af",
      secondary: "#64748b",
      background: "#ffffff",
      text: "#1a1a1a",
      border: "#e2e8f0",
    },
    spacing: {
      base: "1rem",
      heading: "1.25rem",
      section: "1.5rem",
    },
    fontSize: {
      base: "1rem",
      heading: "1.25rem",
      small: "0.875rem",
    },
  },
};

const STORAGE_KEY_PREFIX = "cv-theme-";

export function loadTheme(cvId: string): ThemeName {
  if (typeof window === "undefined") return "modern";

  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${cvId}`);
    if (stored && stored in themes) {
      return stored as ThemeName;
    }
  } catch (error) {
    logger.error("Error loading theme", error);
  }

  return "modern";
}

export function saveTheme(cvId: string, theme: ThemeName): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${cvId}`, theme);
  } catch (error) {
    logger.error("Error saving theme", error);
  }
}


