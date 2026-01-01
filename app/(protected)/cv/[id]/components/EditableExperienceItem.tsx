"use client";

import { useState } from "react";
import EditableText from "./EditableText";
import { Button } from "@/components/ui/button";
import { Plus, X, GripVertical } from "lucide-react";
import type { Experience } from "./types";

interface EditableExperienceItemProps {
  experience: Experience;
  onChange: (experience: Experience) => void;
  isEditing: boolean;
  onRemove?: () => void;
}

export default function EditableExperienceItem({
  experience,
  onChange,
  isEditing,
  onRemove,
}: EditableExperienceItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleFieldChange = (field: keyof Experience, value: any) => {
    onChange({
      ...experience,
      [field]: value,
    });
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    onChange({
      ...experience,
      [field]: value || null,
    });
  };

  const handleAchievementChange = (index: number, value: string) => {
    const newAchievements = [...experience.achievements];
    newAchievements[index] = value;
    onChange({
      ...experience,
      achievements: newAchievements,
    });
  };

  const handleAddAchievement = () => {
    onChange({
      ...experience,
      achievements: [...experience.achievements, ""],
    });
  };

  const handleRemoveAchievement = (index: number) => {
    const newAchievements = experience.achievements.filter((_, i) => i !== index);
    onChange({
      ...experience,
      achievements: newAchievements,
    });
  };

  const dateRange =
    experience.current || !experience.endDate
      ? `${formatDate(experience.startDate)} — Present`
      : `${formatDate(experience.startDate)} — ${formatDate(experience.endDate)}`;

  if (experience.isBrief) {
    return (
      <div className="mb-4 print:mb-3 group">
        <div className="flex items-start gap-2">
          {isEditing && (
            <div className="mt-1 cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
              <div className="flex-1 flex gap-2 items-baseline">
                {isEditing ? (
                  <>
                    <EditableText
                      value={experience.position}
                      onChange={(value) => handleFieldChange("position", value)}
                      className="font-semibold text-gray-900"
                      placeholder="Position"
                    />
                    <span className="text-gray-600"> · </span>
                    <EditableText
                      value={experience.company}
                      onChange={(value) => handleFieldChange("company", value)}
                      className="text-gray-600"
                      placeholder="Company"
                    />
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-gray-900">
                      {experience.position}
                    </span>
                    <span className="text-gray-600"> · {experience.company}</span>
                  </>
                )}
              </div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={formatDateForInput(experience.startDate)}
                    onChange={(e) => handleDateChange("startDate", e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  />
                  <span className="text-gray-500">—</span>
                  <input
                    type="date"
                    value={experience.endDate ? formatDateForInput(experience.endDate) : ""}
                    onChange={(e) => handleDateChange("endDate", e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                    disabled={experience.current}
                  />
                  <label className="flex items-center gap-1 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={experience.current}
                      onChange={(e) =>
                        handleFieldChange("current", e.target.checked)
                      }
                    />
                    Current
                  </label>
                </div>
              ) : (
                <span className="text-sm text-gray-500">{dateRange}</span>
              )}
            </div>
            {isEditing && (
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFieldChange("isBrief", false)}
                >
                  Show Details
                </Button>
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemove}
                    className="text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 print:mb-4 group">
      <div className="flex items-start gap-2">
        {isEditing && (
          <div className="mt-1 cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
            <div className="flex-1 flex gap-2 items-baseline">
              {isEditing ? (
                <>
                  <EditableText
                    value={experience.company}
                    onChange={(value) => handleFieldChange("company", value)}
                    className="font-semibold text-gray-900 text-lg"
                    placeholder="Company"
                  />
                  <span className="text-gray-700"> · </span>
                  <EditableText
                    value={experience.position}
                    onChange={(value) => handleFieldChange("position", value)}
                    className="text-gray-700"
                    placeholder="Position"
                  />
                </>
              ) : (
                <>
                  <span className="font-semibold text-gray-900 text-lg">
                    {experience.company}
                  </span>
                  <span className="text-gray-700"> · {experience.position}</span>
                </>
              )}
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={formatDateForInput(experience.startDate)}
                  onChange={(e) => handleDateChange("startDate", e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                />
                <span className="text-gray-500">—</span>
                <input
                  type="date"
                  value={experience.endDate ? formatDateForInput(experience.endDate) : ""}
                  onChange={(e) => handleDateChange("endDate", e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  disabled={experience.current}
                />
                <label className="flex items-center gap-1 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={experience.current}
                    onChange={(e) =>
                      handleFieldChange("current", e.target.checked)
                    }
                  />
                  Current
                </label>
              </div>
            ) : (
              <span className="text-sm text-gray-500 font-medium">{dateRange}</span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2 mt-2">
              {experience.achievements.map((achievement, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-gray-500 mt-2">•</span>
                  <EditableText
                    value={achievement}
                    onChange={(value) => handleAchievementChange(idx, value)}
                    multiline
                    className="flex-1"
                    placeholder="Achievement description..."
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAchievement(idx)}
                    className="text-destructive shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddAchievement}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Achievement
              </Button>
            </div>
          ) : (
            experience.achievements.length > 0 && (
              <ul className="list-disc list-outside ml-5 space-y-1.5 text-gray-700">
                {experience.achievements.map((achievement, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {achievement}
                  </li>
                ))}
              </ul>
            )
          )}

          {isEditing && (
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFieldChange("isBrief", true)}
              >
                Make Brief
              </Button>
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  className="text-destructive"
                >
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


