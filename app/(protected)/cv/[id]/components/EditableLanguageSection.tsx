"use client";

import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EditableText from "./EditableText";
import type { Language } from "./types";

interface EditableLanguageSectionProps {
  languages: Language[];
  onChange: (languages: Language[]) => void;
  isEditing: boolean;
}

const PROFICIENCY_LEVELS = [
  "Native",
  "Fluent",
  "Advanced",
  "Intermediate",
  "Basic",
  "Elementary",
];

export default function EditableLanguageSection({
  languages,
  onChange,
  isEditing,
}: EditableLanguageSectionProps) {
  const handleLanguageChange = (index: number, field: keyof Language, value: string) => {
    const newLanguages = [...languages];
    newLanguages[index] = {
      ...newLanguages[index],
      [field]: value,
    };
    onChange(newLanguages);
  };

  const handleAddLanguage = () => {
    onChange([
      ...languages,
      {
        name: "",
        proficiencyLevel: "Intermediate",
      },
    ]);
  };

  const handleRemoveLanguage = (index: number) => {
    onChange(languages.filter((_, i) => i !== index));
  };

  if (!languages || languages.length === 0) {
    if (!isEditing) return null;
    return (
      <Button variant="outline" size="sm" onClick={handleAddLanguage}>
        <Plus className="h-4 w-4 mr-1" />
        Add Language
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 print:gap-3">
      {languages.map((language, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 p-2 border border-gray-200 rounded-md group"
        >
          {isEditing ? (
            <>
              <EditableText
                value={language.name}
                onChange={(value) => handleLanguageChange(idx, "name", value)}
                className="font-medium text-gray-700 min-w-[100px]"
                placeholder="Language"
              />
              <span className="text-gray-500">—</span>
              <Select
                value={language.proficiencyLevel}
                onValueChange={(value) =>
                  handleLanguageChange(idx, "proficiencyLevel", value)
                }
              >
                <SelectTrigger className="w-[140px] h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROFICIENCY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveLanguage(idx)}
                className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <span className="font-medium text-gray-700">{language.name}</span>
              <span className="text-gray-500"> — {language.proficiencyLevel}</span>
            </>
          )}
        </div>
      ))}

      {isEditing && (
        <Button variant="outline" size="sm" onClick={handleAddLanguage}>
          <Plus className="h-4 w-4 mr-1" />
          Add Language
        </Button>
      )}
    </div>
  );
}


