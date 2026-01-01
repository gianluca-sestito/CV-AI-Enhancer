"use client";

import { useCVStyleContext } from "./CVStyleProvider";
import type { Experience } from "./types";

interface ExperienceItemProps {
  experience: Experience;
}

export default function ExperienceItem({ experience }: ExperienceItemProps) {
  const { styles } = useCVStyleContext();
  const sectionStyles = styles.sections.experience;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const dateRange =
    experience.current || !experience.endDate
      ? `${formatDate(experience.startDate)} — Present`
      : `${formatDate(experience.startDate)} — ${formatDate(experience.endDate)}`;

  if (experience.isBrief) {
    return (
      <div className="mb-4 print:mb-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
          <div>
            <span className="font-semibold text-gray-900">
              {experience.position}
            </span>
            <span className="text-gray-600"> · {experience.company}</span>
          </div>
          <span className="text-sm text-gray-500">{dateRange}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 print:mb-4">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
        <div>
          <span className="font-semibold text-gray-900 text-lg">
            {experience.company}
          </span>
          <span className="text-gray-700"> · {experience.position}</span>
        </div>
        <span className="text-sm text-gray-500 font-medium">{dateRange}</span>
      </div>
      {experience.achievements.length > 0 && (
        <ul
          className="list-disc list-outside ml-5 space-y-1.5"
          style={{
            color: sectionStyles.color || styles.elements.listItem.color || styles.global.textColor,
          }}
        >
          {experience.achievements.map((achievement, idx) => (
            <li
              key={idx}
              style={{
                fontSize: styles.elements.listItem.fontSize || styles.elements.p.fontSize,
                lineHeight: styles.elements.listItem.lineHeight || styles.elements.p.lineHeight || "1.6",
                marginBottom: styles.elements.listItem.marginBottom || "6px",
                color: styles.elements.listItem.color || styles.elements.p.color || styles.global.textColor,
              }}
            >
              {achievement}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


