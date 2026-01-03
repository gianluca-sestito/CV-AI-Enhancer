"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, GripVertical } from "lucide-react";
import type { CVData, Experience, Education, Language, SkillGroup } from "../types";

interface ContentEditorProps {
  cvData: CVData;
  updateCVData: (updater: (data: CVData) => CVData) => void;
}

export default function ContentEditor({ cvData, updateCVData }: ContentEditorProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Header</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={cvData.header.name}
              onChange={(e) =>
                updateCVData((data) => ({
                  ...data,
                  header: { ...data.header, name: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="role">Role / Title</Label>
            <Input
              id="role"
              value={cvData.header.role || ""}
              onChange={(e) =>
                updateCVData((data) => ({
                  ...data,
                  header: { ...data.header, role: e.target.value || null },
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={cvData.header.location || ""}
              onChange={(e) =>
                updateCVData((data) => ({
                  ...data,
                  header: { ...data.header, location: e.target.value || null },
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={cvData.header.email || ""}
              onChange={(e) =>
                updateCVData((data) => ({
                  ...data,
                  header: { ...data.header, email: e.target.value || null },
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={cvData.header.phone || ""}
              onChange={(e) =>
                updateCVData((data) => ({
                  ...data,
                  header: { ...data.header, phone: e.target.value || null },
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
        <Textarea
          value={cvData.summary}
          onChange={(e) =>
            updateCVData((data) => ({ ...data, summary: e.target.value }))
          }
          rows={4}
          placeholder="Professional summary..."
        />
      </div>

      {/* Experiences */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Experiences</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateCVData((data) => ({
                ...data,
                experiences: [
                  ...data.experiences,
                  {
                    experienceId: `exp-${Date.now()}`,
                    company: "",
                    position: "",
                    startDate: new Date().toISOString().split("T")[0],
                    endDate: null,
                    current: false,
                    achievements: [],
                    isBrief: false,
                  },
                ],
              }))
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-3">
          {cvData.experiences.map((exp, idx) => (
            <ExperienceEditor
              key={exp.experienceId}
              experience={exp}
              index={idx}
              onUpdate={(updated) =>
                updateCVData((data) => {
                  const newExperiences = [...data.experiences];
                  newExperiences[idx] = updated;
                  return { ...data, experiences: newExperiences };
                })
              }
              onRemove={() =>
                updateCVData((data) => ({
                  ...data,
                  experiences: data.experiences.filter((_, i) => i !== idx),
                }))
              }
            />
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Skills</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateCVData((data) => ({
                ...data,
                skillGroups: [
                  ...data.skillGroups,
                  { category: "New Category", skills: [] },
                ],
              }))
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Category
          </Button>
        </div>
        <div className="space-y-3">
          {cvData.skillGroups.map((group, groupIdx) => (
            <SkillGroupEditor
              key={groupIdx}
              group={group}
              index={groupIdx}
              onUpdate={(updated) =>
                updateCVData((data) => {
                  const newGroups = [...data.skillGroups];
                  newGroups[groupIdx] = updated;
                  return { ...data, skillGroups: newGroups };
                })
              }
              onRemove={() =>
                updateCVData((data) => ({
                  ...data,
                  skillGroups: data.skillGroups.filter((_, i) => i !== groupIdx),
                }))
              }
            />
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Education</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateCVData((data) => ({
                ...data,
                education: [
                  ...data.education,
                  {
                    institution: "",
                    degree: "",
                    fieldOfStudy: null,
                    startDate: new Date().toISOString().split("T")[0],
                    endDate: null,
                    current: false,
                    description: null,
                  },
                ],
              }))
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-3">
          {cvData.education.map((edu, idx) => (
            <EducationEditor
              key={idx}
              education={edu}
              index={idx}
              onUpdate={(updated) =>
                updateCVData((data) => {
                  const newEducation = [...data.education];
                  newEducation[idx] = updated;
                  return { ...data, education: newEducation };
                })
              }
              onRemove={() =>
                updateCVData((data) => ({
                  ...data,
                  education: data.education.filter((_, i) => i !== idx),
                }))
              }
            />
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Languages</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateCVData((data) => ({
                ...data,
                languages: [
                  ...data.languages,
                  { name: "", proficiencyLevel: "Intermediate" },
                ],
              }))
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {cvData.languages.map((lang, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={lang.name}
                onChange={(e) =>
                  updateCVData((data) => {
                    const newLanguages = [...data.languages];
                    newLanguages[idx] = { ...lang, name: e.target.value };
                    return { ...data, languages: newLanguages };
                  })
                }
                placeholder="Language"
                className="flex-1"
              />
              <Input
                value={lang.proficiencyLevel}
                onChange={(e) =>
                  updateCVData((data) => {
                    const newLanguages = [...data.languages];
                    newLanguages[idx] = { ...lang, proficiencyLevel: e.target.value };
                    return { ...data, languages: newLanguages };
                  })
                }
                placeholder="Level"
                className="w-32"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateCVData((data) => ({
                    ...data,
                    languages: data.languages.filter((_, i) => i !== idx),
                  }))
                }
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExperienceEditor({
  experience,
  index,
  onUpdate,
  onRemove,
}: {
  experience: Experience;
  index: number;
  onUpdate: (exp: Experience) => void;
  onRemove: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-gray-400" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 justify-start text-left"
        >
          {experience.company || experience.position || `Experience ${index + 1}`}
        </Button>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      {isExpanded && (
        <div className="space-y-2 pl-6">
          <div>
            <Label>Company</Label>
            <Input
              value={experience.company}
              onChange={(e) => onUpdate({ ...experience, company: e.target.value })}
            />
          </div>
          <div>
            <Label>Position</Label>
            <Input
              value={experience.position}
              onChange={(e) => onUpdate({ ...experience, position: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={experience.startDate}
                onChange={(e) => onUpdate({ ...experience, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={experience.endDate || ""}
                onChange={(e) =>
                  onUpdate({ ...experience, endDate: e.target.value || null })
                }
                disabled={experience.current}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`current-${index}`}
              checked={experience.current}
              onChange={(e) => onUpdate({ ...experience, current: e.target.checked })}
            />
            <Label htmlFor={`current-${index}`} className="cursor-pointer">
              Current Position
            </Label>
          </div>
          <div>
            <Label>Achievements (one per line)</Label>
            <Textarea
              value={experience.achievements.join("\n")}
              onChange={(e) => {
                // Split by newlines and filter empty lines, but preserve trailing empty lines
                // to allow users to create new lines by pressing Enter
                const lines = e.target.value.split("\n");
                // Filter empty lines in the middle, but keep trailing empty lines
                const filtered: string[] = [];
                for (let i = 0; i < lines.length; i++) {
                  const line = lines[i];
                  const isLast = i === lines.length - 1;
                  // Keep non-empty lines, and keep empty lines if they're at the end
                  if (line.trim() || isLast) {
                    filtered.push(line);
                  }
                }
                onUpdate({
                  ...experience,
                  achievements: filtered,
                });
              }}
              onKeyDown={(e) => {
                // Ensure Enter key creates a new line in textarea
                // Don't prevent default behavior for Enter in textarea
                if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                  // Allow default behavior - Enter should create a new line
                  // This handler ensures no parent handlers interfere
                  e.stopPropagation();
                }
              }}
              rows={4}
              placeholder="Achievement 1&#10;Achievement 2"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SkillGroupEditor({
  group,
  index,
  onUpdate,
  onRemove,
}: {
  group: SkillGroup;
  index: number;
  onUpdate: (group: SkillGroup) => void;
  onRemove: () => void;
}) {
  const [skillsInput, setSkillsInput] = useState(group.skills.join(", "));

  // Sync with group.skills when it changes externally
  useEffect(() => {
    setSkillsInput(group.skills.join(", "));
  }, [group.skills]);

  const handleSkillsChange = (value: string) => {
    setSkillsInput(value);
    // Process skills immediately but keep the raw input for display
    const skills = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onUpdate({
      ...group,
      skills,
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Input
          value={group.category}
          onChange={(e) => onUpdate({ ...group, category: e.target.value })}
          placeholder="Category name"
          className="flex-1"
        />
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div>
        <Label>Skills (comma-separated)</Label>
        <Input
          type="text"
          value={skillsInput}
          onChange={(e) => handleSkillsChange(e.target.value)}
          onBlur={() => {
            // Ensure skills are properly formatted on blur
            const skills = skillsInput
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            setSkillsInput(skills.join(", "));
            onUpdate({
              ...group,
              skills,
            });
          }}
          placeholder="Skill1, Skill2, Skill3"
        />
      </div>
    </div>
  );
}

function EducationEditor({
  education,
  index,
  onUpdate,
  onRemove,
}: {
  education: Education;
  index: number;
  onUpdate: (edu: Education) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {education.degree || education.institution || `Education ${index + 1}`}
        </span>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        <div>
          <Label>Institution</Label>
          <Input
            value={education.institution}
            onChange={(e) => onUpdate({ ...education, institution: e.target.value })}
          />
        </div>
        <div>
          <Label>Degree</Label>
          <Input
            value={education.degree}
            onChange={(e) => onUpdate({ ...education, degree: e.target.value })}
          />
        </div>
        <div>
          <Label>Field of Study</Label>
          <Input
            value={education.fieldOfStudy || ""}
            onChange={(e) =>
              onUpdate({ ...education, fieldOfStudy: e.target.value || null })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={education.startDate}
              onChange={(e) => onUpdate({ ...education, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              value={education.endDate || ""}
              onChange={(e) =>
                onUpdate({ ...education, endDate: e.target.value || null })
              }
              disabled={education.current}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`edu-current-${index}`}
            checked={education.current}
            onChange={(e) => onUpdate({ ...education, current: e.target.checked })}
          />
          <Label htmlFor={`edu-current-${index}`} className="cursor-pointer">
            Currently Studying
          </Label>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            value={education.description || ""}
            onChange={(e) =>
              onUpdate({ ...education, description: e.target.value || null })
            }
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}

