"use client";

import { useCVStyleContext } from "./CVStyleProvider";
import type { Language } from "./types";

interface LanguageSectionProps {
  languages: Language[];
}

export default function LanguageSection({
  languages,
}: LanguageSectionProps) {
  const { styles } = useCVStyleContext();
  const sectionStyles = styles.sections.languages;

  if (!languages || languages.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-4 print:gap-3">
      {languages.map((language, idx) => (
        <div
          key={idx}
          style={{
            color: sectionStyles.color || styles.elements.p.color || styles.global.textColor,
          }}
        >
          <span style={{ fontWeight: "500" }}>{language.name}</span>
          <span style={{ color: styles.global.secondaryColor }}>
            {" "}
            — {language.proficiencyLevel}
          </span>
        </div>
      ))}
    </div>
  );
}


