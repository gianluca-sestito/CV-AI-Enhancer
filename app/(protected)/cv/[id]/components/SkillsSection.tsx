"use client";

import { useCVStyleContext } from "./CVStyleProvider";
import type { SkillGroup } from "./types";

interface SkillsSectionProps {
  skillGroups: SkillGroup[];
}

export default function SkillsSection({ skillGroups }: SkillsSectionProps) {
  const { styles } = useCVStyleContext();
  const sectionStyles = styles.sections.skills;

  if (skillGroups.length === 0) return null;

  return (
    <div className="space-y-4 print:space-y-3">
      {skillGroups.map((group, idx) => (
        <div key={idx} className="space-y-2">
          <h3
            style={{
              fontSize: styles.elements.h3.fontSize,
              fontWeight: styles.elements.h3.fontWeight,
              color: styles.elements.h3.color || styles.global.textColor,
              marginBottom: styles.elements.h3.marginBottom || "8px",
            }}
          >
            {group.category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {group.skills.map((skill, skillIdx) => (
              <span
                key={skillIdx}
                className="inline-block rounded-md"
                style={{
                  fontSize: styles.elements.badge.fontSize,
                  fontWeight: styles.elements.badge.fontWeight,
                  padding: styles.elements.badge.padding || "4px 12px",
                  backgroundColor: "#f3f4f6",
                  color: sectionStyles.color || styles.elements.badge.color || styles.global.textColor,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


