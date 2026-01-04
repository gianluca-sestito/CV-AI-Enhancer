"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, GripVertical, Download } from "lucide-react";
import type { CVData, Experience, Education, Language, SkillGroup } from "../types";
import ProfileDataImportDialog from "../ProfileDataImportDialog";
import { experiencesMatch } from "../profileDataTransformers";
import SkillInput from "../SkillInput";
import SkillBadge from "../SkillBadge";
import { useProfileData } from "../useProfileData";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ContentEditorProps {
  cvData: CVData;
  updateCVData: (updater: (data: CVData) => CVData) => void;
}

/**
 * Renders a full-featured CV editor for editing header, summary, experiences, skills, education, and languages.
 *
 * The component binds form controls to `cvData` and applies immutable updates via `updateCVData`.
 *
 * @param cvData - The current CV data model to edit.
 * @param updateCVData - Setter that accepts an updater function `(prev: CVData) => CVData` to immutably apply changes to the CV data.
 * @returns A React element containing the CV content editor UI.
 */
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
          {cvData.skillGroups.map((group, groupIdx) => {
            // Get all skills from all groups to avoid duplicates
            const allSkills = cvData.skillGroups.flatMap((g) => g.skills);
            return (
              <SkillGroupEditor
                key={groupIdx}
                group={group}
                index={groupIdx}
                allSkills={allSkills}
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
            );
          })}
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

/**
 * Renders an editable, collapsible editor for a single experience entry with fields for company, position, start/end dates, current flag, and newline-separated achievements; includes an import-from-profile workflow.
 *
 * @param experience - The experience entry being edited
 * @param index - Zero-based index of the experience in the list (used for labels and ids)
 * @param onUpdate - Called with the updated Experience when any field changes
 * @param onRemove - Called to remove this experience entry
 * @returns The Experience editor React element
 */
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
  const [importDialogOpen, setImportDialogOpen] = useState(false);

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
            <div className="flex items-center justify-between mb-1">
              <Label>Achievements (one per line)</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportDialogOpen(true)}
                className="text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Import from Profile
              </Button>
            </div>
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
          <ProfileDataImportDialog
            open={importDialogOpen}
            onOpenChange={setImportDialogOpen}
            currentExperience={experience}
            onImport={(importedData) => {
              // If company/position match, only replace achievements
              // Otherwise, replace the entire experience
              const matches = experiencesMatch(
                {
                  company: experience.company,
                  position: experience.position,
                },
                {
                  company: importedData.company,
                  position: importedData.position,
                }
              );

              if (matches) {
                // Only replace achievements
                onUpdate({
                  ...experience,
                  achievements: importedData.achievements,
                });
              } else {
                // Replace entire experience but keep the experienceId
                onUpdate({
                  ...experience,
                  ...importedData,
                });
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Renders an editor for a single skill group, allowing editing of the category, adding/removing skills, and drag-and-drop reordering.
 *
 * The component integrates profile-derived skill suggestions, prevents duplicate skills within the group, and reports immutable updates
 * to the parent via `onUpdate`. Calling `onRemove` signals that the entire group should be deleted.
 *
 * @param group - The skill group being edited (category and skills).
 * @param index - The zero-based position of this group in the parent list (used for display/order context).
 * @param allSkills - A flattened list of all known skills across groups used to surface existing skills as suggestions.
 * @param onUpdate - Called with the updated `SkillGroup` when the category, skills, or their order change.
 * @param onRemove - Called when the user requests removal of this skill group.
 */
function SkillGroupEditor({
  group,
  index,
  allSkills,
  onUpdate,
  onRemove,
}: {
  group: SkillGroup;
  index: number;
  allSkills: string[];
  onUpdate: (group: SkillGroup) => void;
  onRemove: () => void;
}) {
  const { skills: profileSkills } = useProfileData();
  
  // Extract skill names from profile skills
  const profileSkillNames = profileSkills.map((skill) => skill.name);

  const handleAddSkill = (skill: string) => {
    if (!group.skills.includes(skill)) {
      onUpdate({
        ...group,
        skills: [...group.skills, skill],
      });
    }
  };

  const handleRemoveSkill = (skillIndex: number) => {
    onUpdate({
      ...group,
      skills: group.skills.filter((_, i) => i !== skillIndex),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = group.skills.findIndex((_, idx) => `skill-${idx}` === active.id);
      const newIndex = group.skills.findIndex((_, idx) => `skill-${idx}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newSkills = arrayMove(group.skills, oldIndex, newIndex);
        onUpdate({
          ...group,
          skills: newSkills,
        });
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
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
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-900">Skills</Label>
        {group.skills.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={group.skills.map((_, idx) => `skill-${idx}`)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md min-h-[2.5rem]">
                {group.skills.map((skill, skillIdx) => (
                  <SortableSkillBadge
                    key={skillIdx}
                    id={`skill-${skillIdx}`}
                    skill={skill}
                    onRemove={() => handleRemoveSkill(skillIdx)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        <div className="pt-1">
          <SkillInput
            onAdd={handleAddSkill}
            existingSkills={allSkills}
            profileSkills={profileSkillNames}
            placeholder="Add a skill..."
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Renders a draggable skill badge with a visible drag handle and remove action.
 *
 * @param id - Unique identifier for the draggable item (used by the drag-and-drop system)
 * @param skill - The text label displayed on the badge
 * @param onRemove - Callback invoked when the badge's remove control is activated
 * @returns The rendered draggable skill badge element
 */
function SortableSkillBadge({
  id,
  skill,
  onRemove,
}: {
  id: string;
  skill: string;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SkillBadge
        skill={skill}
        onRemove={onRemove}
        showDragHandle={true}
        isDragging={isDragging}
        dragListeners={listeners}
        dragAttributes={attributes}
      />
    </div>
  );
}

/**
 * Render an editable card for a single education entry.
 *
 * @param education - The education entry being edited
 * @param index - Zero-based index of the entry (used for labeling and element ids)
 * @param onUpdate - Callback invoked with the updated education object when any field changes
 * @param onRemove - Callback invoked when the entry should be removed
 * @returns The rendered education editor element
 */
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
