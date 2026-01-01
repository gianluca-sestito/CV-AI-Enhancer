"use client";

import { useState } from "react";
import EditableText from "./EditableText";
import SkillBadge from "./SkillBadge";
import SkillInput from "./SkillInput";
import { Button } from "@/components/ui/button";
import { Plus, X, GripVertical } from "lucide-react";
import type { SkillGroup } from "./types";

interface EditableSkillsSectionProps {
  skillGroups: SkillGroup[];
  onChange: (skillGroups: SkillGroup[]) => void;
  isEditing: boolean;
}

export default function EditableSkillsSection({
  skillGroups,
  onChange,
  isEditing,
}: EditableSkillsSectionProps) {
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);

  const handleCategoryChange = (index: number, category: string) => {
    const newGroups = [...skillGroups];
    newGroups[index] = {
      ...newGroups[index],
      category,
    };
    onChange(newGroups);
  };

  const handleAddSkill = (categoryIndex: number, skill: string) => {
    const newGroups = [...skillGroups];
    if (!newGroups[categoryIndex].skills.includes(skill)) {
      newGroups[categoryIndex] = {
        ...newGroups[categoryIndex],
        skills: [...newGroups[categoryIndex].skills, skill],
      };
      onChange(newGroups);
    }
  };

  const handleRemoveSkill = (categoryIndex: number, skillIndex: number) => {
    const newGroups = [...skillGroups];
    newGroups[categoryIndex] = {
      ...newGroups[categoryIndex],
      skills: newGroups[categoryIndex].skills.filter((_, i) => i !== skillIndex),
    };
    onChange(newGroups);
  };

  const handleAddCategory = () => {
    onChange([
      ...skillGroups,
      {
        category: "New Category",
        skills: [],
      },
    ]);
    setEditingCategoryIndex(skillGroups.length);
  };

  const handleRemoveCategory = (index: number) => {
    onChange(skillGroups.filter((_, i) => i !== index));
  };

  const getAllSkills = () => {
    return skillGroups.flatMap((group) => group.skills);
  };

  if (skillGroups.length === 0 && !isEditing) return null;

  return (
    <div className="space-y-4 print:space-y-3">
      {skillGroups.map((group, groupIdx) => (
        <div key={groupIdx} className="space-y-2 group">
          <div className="flex items-center gap-2">
            {isEditing && (
              <GripVertical className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing" />
            )}
            {isEditing ? (
              <EditableText
                value={group.category}
                onChange={(value) => handleCategoryChange(groupIdx, value)}
                className="font-semibold text-gray-900 text-base"
                placeholder="Category name"
              />
            ) : (
              <h3 className="font-semibold text-gray-900 text-base">
                {group.category}
              </h3>
            )}
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveCategory(groupIdx)}
                className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {group.skills.map((skill, skillIdx) => (
              <SkillBadge
                key={skillIdx}
                skill={skill}
                onRemove={
                  isEditing
                    ? () => handleRemoveSkill(groupIdx, skillIdx)
                    : undefined
                }
                showDragHandle={isEditing}
              />
            ))}
          </div>

          {isEditing && (
            <div className="mt-2">
              <SkillInput
                onAdd={(skill) => handleAddSkill(groupIdx, skill)}
                existingSkills={getAllSkills()}
                placeholder={`Add skill to ${group.category}...`}
              />
            </div>
          )}
        </div>
      ))}

      {isEditing && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddCategory}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Category
        </Button>
      )}
    </div>
  );
}


