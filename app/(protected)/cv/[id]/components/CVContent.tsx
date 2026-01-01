"use client";

import { memo } from "react";
import CvLayout from "./CvLayout";
import CvHeader from "./CvHeader";
import CvSection from "./CvSection";
import ExperienceItem from "./ExperienceItem";
import SkillsSection from "./SkillsSection";
import LanguageSection from "./LanguageSection";
import type { CVData } from "./types";

interface CVContentProps {
  cvData: CVData;
}

function CVContent({ cvData }: CVContentProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <CvLayout>
      <CvHeader header={cvData.header} />

      {cvData.summary && (
        <CvSection title="Summary" sectionKey="summary">
          <p style={{ lineHeight: "1.6" }}>{cvData.summary}</p>
        </CvSection>
      )}

      {cvData.experiences && cvData.experiences.length > 0 && (
        <CvSection title="Professional Experience" sectionKey="experience">
          {cvData.experiences.map((experience) => (
            <ExperienceItem
              key={experience.experienceId}
              experience={experience}
            />
          ))}
        </CvSection>
      )}

      {cvData.skillGroups && cvData.skillGroups.length > 0 && (
        <CvSection title="Technical Skills" sectionKey="skills">
          <SkillsSection skillGroups={cvData.skillGroups} />
        </CvSection>
      )}

      {cvData.education && cvData.education.length > 0 && (
        <CvSection title="Education" sectionKey="education">
          <div className="space-y-4 print:space-y-3">
            {cvData.education.map((edu, idx) => {
              const dateRange =
                edu.current || !edu.endDate
                  ? `${formatDate(edu.startDate)} — Present`
                  : `${formatDate(edu.startDate)} — ${formatDate(edu.endDate)}`;

              return (
                <div key={idx} className="mb-4 print:mb-3">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                    <div>
                      <span className="font-semibold text-gray-900">
                        {edu.degree}
                      </span>
                      {edu.fieldOfStudy && (
                        <span className="text-gray-600">
                          {" "}
                          in {edu.fieldOfStudy}
                        </span>
                      )}
                      <span className="text-gray-600"> · {edu.institution}</span>
                    </div>
                    <span className="text-sm text-gray-500">{dateRange}</span>
                  </div>
                  {edu.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {edu.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CvSection>
      )}

      {cvData.languages && cvData.languages.length > 0 && (
        <CvSection title="Languages" sectionKey="languages">
          <LanguageSection languages={cvData.languages} />
        </CvSection>
      )}
    </CvLayout>
  );
}

export default memo(CVContent);

