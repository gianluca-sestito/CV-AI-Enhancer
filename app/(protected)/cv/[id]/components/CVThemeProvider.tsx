"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { themes, loadTheme, saveTheme, type ThemeName, type Theme } from "./themes";

interface CVThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const CVThemeContext = createContext<CVThemeContextType | undefined>(undefined);

export function useCVTheme() {
  const context = useContext(CVThemeContext);
  if (!context) {
    throw new Error("useCVTheme must be used within CVThemeProvider");
  }
  return context;
}

interface CVThemeProviderProps {
  children: ReactNode;
  cvId: string;
}

export function CVThemeProvider({ children, cvId }: CVThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(() => loadTheme(cvId));

  useEffect(() => {
    setThemeName(loadTheme(cvId));
  }, [cvId]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeName(newTheme);
    saveTheme(cvId, newTheme);
  };

  const theme = themes[themeName];

  return (
    <CVThemeContext.Provider value={{ theme, themeName, setTheme }}>
      <div
        style={{
          fontFamily: theme.fontFamily.body,
          color: theme.colors.text,
          backgroundColor: theme.colors.background,
          "--cv-primary": theme.colors.primary,
          "--cv-secondary": theme.colors.secondary,
          "--cv-border": theme.colors.border,
          "--cv-spacing": theme.spacing.base,
          "--cv-heading-spacing": theme.spacing.heading,
          "--cv-section-spacing": theme.spacing.section,
          "--cv-font-size": theme.fontSize.base,
          "--cv-heading-size": theme.fontSize.heading,
          "--cv-small-size": theme.fontSize.small,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </CVThemeContext.Provider>
  );
}


