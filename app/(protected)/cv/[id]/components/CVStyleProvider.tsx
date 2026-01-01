"use client";

import { createContext, useContext, ReactNode } from "react";
import { useCVStyles } from "./useCVStyles";
import type { CVStyles } from "./types";

interface CVStyleContextType {
  styles: CVStyles;
  updateStyles: (updater: (current: CVStyles) => CVStyles) => void;
  updateGlobalStyle: (field: keyof CVStyles["global"], value: string) => void;
  updateSectionStyle: (
    section: keyof CVStyles["sections"],
    field: keyof CVStyles["sections"][keyof CVStyles["sections"]],
    value: string
  ) => void;
  updateElementStyle: (
    element: keyof CVStyles["elements"],
    field: keyof CVStyles["elements"][keyof CVStyles["elements"]],
    value: string
  ) => void;
  resetStyles: () => void;
  saveStylesToDatabase: () => Promise<{ success: boolean; error?: string }>;
}

const CVStyleContext = createContext<CVStyleContextType | undefined>(undefined);

export function useCVStyleContext() {
  const context = useContext(CVStyleContext);
  if (!context) {
    throw new Error("useCVStyleContext must be used within CVStyleProvider");
  }
  return context;
}

interface CVStyleProviderProps {
  children: ReactNode;
  cvId: string;
}

export function CVStyleProvider({ children, cvId }: CVStyleProviderProps) {
  const styleHook = useCVStyles(cvId);

  return (
    <CVStyleContext.Provider value={styleHook}>
      <div
        style={{
          fontFamily: styleHook.styles.global.fontFamily,
          color: styleHook.styles.global.textColor,
          backgroundColor: styleHook.styles.global.backgroundColor,
          fontSize: styleHook.styles.global.baseFontSize,
          lineHeight: styleHook.styles.global.lineHeight,
          "--cv-primary": styleHook.styles.global.primaryColor,
          "--cv-secondary": styleHook.styles.global.secondaryColor,
          "--cv-border": styleHook.styles.global.borderColor,
          "--cv-spacing": styleHook.styles.global.baseSpacing,
          "--cv-section-spacing": styleHook.styles.global.sectionSpacing,
          "--cv-font-size": styleHook.styles.global.baseFontSize,
          "--cv-h1-size": styleHook.styles.elements.h1.fontSize,
          "--cv-h2-size": styleHook.styles.elements.h2.fontSize,
          "--cv-h3-size": styleHook.styles.elements.h3.fontSize,
          "--cv-p-size": styleHook.styles.elements.p.fontSize,
          "--cv-h1-color": styleHook.styles.elements.h1.color,
          "--cv-h2-color": styleHook.styles.elements.h2.color,
          "--cv-h3-color": styleHook.styles.elements.h3.color,
          "--cv-p-color": styleHook.styles.elements.p.color,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </CVStyleContext.Provider>
  );
}

