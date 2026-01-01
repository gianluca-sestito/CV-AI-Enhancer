"use client";

import { useState, useEffect, useCallback } from "react";
import type { CVStyles } from "./types";

const STORAGE_KEY_PREFIX = "cv-styles-";

const defaultStyles: CVStyles = {
  global: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    baseFontSize: "11pt",
    lineHeight: "1.6",
    textColor: "#111827",
    backgroundColor: "#ffffff",
    primaryColor: "#111827",
    secondaryColor: "#6b7280",
    borderColor: "#d1d5db",
    baseSpacing: "1rem",
    sectionSpacing: "2rem",
  },
  sections: {
    header: {},
    summary: {},
    experience: {},
    skills: {},
    education: {},
    languages: {},
  },
  elements: {
    h1: {
      fontSize: "30pt",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "8px",
    },
    h2: {
      fontSize: "20pt",
      fontWeight: "bold",
      color: "#111827",
      marginTop: "32px",
      marginBottom: "16px",
      paddingBottom: "8px",
    },
    h3: {
      fontSize: "16pt",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "8px",
    },
    p: {
      fontSize: "11pt",
      lineHeight: "1.6",
      color: "#374151",
    },
    badge: {
      fontSize: "14pt",
      fontWeight: "500",
      padding: "4px 12px",
    },
    listItem: {
      fontSize: "11pt",
      lineHeight: "1.6",
      color: "#374151",
      marginBottom: "6px",
    },
  },
};

export function useCVStyles(cvId: string) {
  const [styles, setStyles] = useState<CVStyles>(() => loadStyles(cvId));

  useEffect(() => {
    setStyles(loadStyles(cvId));
  }, [cvId]);

  const updateStyles = useCallback(
    (updater: (current: CVStyles) => CVStyles) => {
      setStyles((current) => {
        const updated = updater(current);
        saveStyles(cvId, updated);
        return updated;
      });
    },
    [cvId]
  );

  const updateGlobalStyle = useCallback(
    (field: keyof CVStyles["global"], value: string) => {
      updateStyles((current) => ({
        ...current,
        global: {
          ...current.global,
          [field]: value,
        },
      }));
    },
    [updateStyles]
  );

  const updateSectionStyle = useCallback(
    (section: keyof CVStyles["sections"], field: keyof CVStyles["sections"][keyof CVStyles["sections"]], value: string) => {
      updateStyles((current) => ({
        ...current,
        sections: {
          ...current.sections,
          [section]: {
            ...current.sections[section],
            [field]: value,
          },
        },
      }));
    },
    [updateStyles]
  );

  const updateElementStyle = useCallback(
    (element: keyof CVStyles["elements"], field: keyof CVStyles["elements"][keyof CVStyles["elements"]], value: string) => {
      updateStyles((current) => ({
        ...current,
        elements: {
          ...current.elements,
          [element]: {
            ...current.elements[element],
            [field]: value,
          },
        },
      }));
    },
    [updateStyles]
  );

  const resetStyles = useCallback(() => {
    setStyles(defaultStyles);
    saveStyles(cvId, defaultStyles);
  }, [cvId]);

  const saveStylesToDatabase = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/cv/${cvId}/styles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ styles }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to save styles";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          if (errorData.details && Array.isArray(errorData.details)) {
            // Zod validation errors
            errorMessage = `Validation error: ${errorData.details.map((e: any) => e.message || e.path?.join(".")).join(", ")}`;
          }
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return { success: true };
    } catch (error) {
      console.error("Error saving styles to database:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save styles",
      };
    }
  }, [cvId, styles]);

  return {
    styles,
    updateStyles,
    updateGlobalStyle,
    updateSectionStyle,
    updateElementStyle,
    resetStyles,
    saveStylesToDatabase,
  };
}

function loadStyles(cvId: string): CVStyles {
  if (typeof window === "undefined") return defaultStyles;

  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${cvId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      return mergeStyles(defaultStyles, parsed);
    }
  } catch (error) {
    console.error("Error loading styles:", error);
  }

  return defaultStyles;
}

function saveStyles(cvId: string, styles: CVStyles): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${cvId}`, JSON.stringify(styles));
  } catch (error) {
    console.error("Error saving styles:", error);
  }
}

function mergeStyles(defaults: CVStyles, overrides: Partial<CVStyles>): CVStyles {
  return {
    global: { ...defaults.global, ...overrides.global },
    sections: {
      header: { ...defaults.sections.header, ...overrides.sections?.header },
      summary: { ...defaults.sections.summary, ...overrides.sections?.summary },
      experience: { ...defaults.sections.experience, ...overrides.sections?.experience },
      skills: { ...defaults.sections.skills, ...overrides.sections?.skills },
      education: { ...defaults.sections.education, ...overrides.sections?.education },
      languages: { ...defaults.sections.languages, ...overrides.sections?.languages },
    },
    elements: {
      h1: { ...defaults.elements.h1, ...overrides.elements?.h1 },
      h2: { ...defaults.elements.h2, ...overrides.elements?.h2 },
      h3: { ...defaults.elements.h3, ...overrides.elements?.h3 },
      p: { ...defaults.elements.p, ...overrides.elements?.p },
      badge: { ...defaults.elements.badge, ...overrides.elements?.badge },
      listItem: { ...defaults.elements.listItem, ...overrides.elements?.listItem },
    },
  };
}

