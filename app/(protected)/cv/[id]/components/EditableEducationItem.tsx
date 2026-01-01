"use client";

import EditableText from "./EditableText";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Education } from "./types";

interface EditableEducationItemProps {
  education: Education;
  onChange: (education: Education) => void;
  isEditing: boolean;
  onRemove?: () => void;
}

export default function EditableEducationItem({
  education,
  onChange,
  isEditing,
  onRemove,
}: EditableEducationItemProps) {
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

  const handleFieldChange = (field: keyof Education, value: any) => {
    onChange({
      ...education,
      [field]: value,
    });
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    onChange({
      ...education,
      [field]: value || null,
    });
  };

  const dateRange =
    education.current || !education.endDate
      ? `${formatDate(education.startDate)} — Present`
      : `${formatDate(education.startDate)} — ${formatDate(education.endDate)}`;

  return (
    <div className="mb-4 print:mb-3">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
        <div className="flex-1 flex gap-2 items-baseline flex-wrap">
          {isEditing ? (
            <>
              <EditableText
                value={education.degree}
                onChange={(value) => handleFieldChange("degree", value)}
                className="font-semibold text-gray-900"
                placeholder="Degree"
              />
              {education.fieldOfStudy && (
                <>
                  <span className="text-gray-600"> in </span>
                  <EditableText
                    value={education.fieldOfStudy}
                    onChange={(value) => handleFieldChange("fieldOfStudy", value)}
                    className="text-gray-600"
                    placeholder="Field of Study"
                  />
                </>
              )}
              <span className="text-gray-600"> · </span>
              <EditableText
                value={education.institution}
                onChange={(value) => handleFieldChange("institution", value)}
                className="text-gray-600"
                placeholder="Institution"
              />
            </>
          ) : (
            <>
              <span className="font-semibold text-gray-900">{education.degree}</span>
              {education.fieldOfStudy && (
                <span className="text-gray-600"> in {education.fieldOfStudy}</span>
              )}
              <span className="text-gray-600"> · {education.institution}</span>
            </>
          )}
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={formatDateForInput(education.startDate)}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            />
            <span className="text-gray-500">—</span>
            <input
              type="date"
              value={education.endDate ? formatDateForInput(education.endDate) : ""}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
              disabled={education.current}
            />
            <label className="flex items-center gap-1 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={education.current}
                onChange={(e) => handleFieldChange("current", e.target.checked)}
              />
              Current
            </label>
          </div>
        ) : (
          <span className="text-sm text-gray-500">{dateRange}</span>
        )}
      </div>

      {isEditing ? (
        <EditableText
          value={education.description || ""}
          onChange={(value) => handleFieldChange("description", value || null)}
          multiline
          className="text-sm text-gray-600 mt-1"
          placeholder="Description (optional)"
        />
      ) : (
        education.description && (
          <p className="text-sm text-gray-600 mt-1">{education.description}</p>
        )
      )}

      {isEditing && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="mt-2 text-destructive"
        >
          <X className="h-4 w-4 mr-1" />
          Remove
        </Button>
      )}
    </div>
  );
}


