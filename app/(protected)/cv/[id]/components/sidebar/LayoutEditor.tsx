"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GripVertical } from "lucide-react";
import type { CVData } from "../types";
import { DraggableList } from "../DraggableList";

interface LayoutEditorProps {
  cvData: CVData;
  updateCVData: (updater: (data: CVData) => CVData) => void;
}

const SECTIONS = [
  { id: "header", label: "Header" },
  { id: "summary", label: "Summary" },
  { id: "experience", label: "Professional Experience" },
  { id: "skills", label: "Technical Skills" },
  { id: "education", label: "Education" },
  { id: "languages", label: "Languages" },
] as const;

export default function LayoutEditor({ cvData, updateCVData }: LayoutEditorProps) {
  const [visibleSections, setVisibleSections] = useState({
    header: true,
    summary: !!cvData.summary,
    experience: cvData.experiences.length > 0,
    skills: cvData.skillGroups.length > 0,
    education: cvData.education.length > 0,
    languages: cvData.languages.length > 0,
  });

  const toggleSection = (sectionId: string) => {
    setVisibleSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId as keyof typeof prev],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Section Visibility */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Section Visibility</h3>
        {SECTIONS.map((section) => (
          <div key={section.id} className="flex items-center justify-between">
            <Label htmlFor={`toggle-${section.id}`} className="cursor-pointer">
              {section.label}
            </Label>
            <Switch
              id={`toggle-${section.id}`}
              checked={visibleSections[section.id as keyof typeof visibleSections]}
              onCheckedChange={() => toggleSection(section.id)}
            />
          </div>
        ))}
      </div>

      {/* Section Ordering */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Section Order</h3>
        <p className="text-xs text-gray-500">
          Drag to reorder sections (coming soon)
        </p>
      </div>
    </div>
  );
}


