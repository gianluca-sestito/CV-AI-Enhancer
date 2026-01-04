"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SkillInputProps {
  onAdd: (skill: string) => void;
  existingSkills?: string[];
  profileSkills?: string[]; // Skills from user's profile
  placeholder?: string;
}

// Common skills for autocomplete suggestions
const COMMON_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "Spring Boot",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "Git",
  "CI/CD",
  "GraphQL",
  "REST API",
  "Microservices",
  "Agile",
  "Scrum",
];

/**
 * Controlled skill input component with prioritized autocomplete suggestions and an add action.
 *
 * Displays suggestions sourced from `profileSkills` first, then `COMMON_SKILLS`, excluding any `existingSkills`. When the input is empty it shows up to five available profile skills. Selecting a suggestion or pressing Enter adds the skill via `onAdd`; Escape hides the suggestion list. The add button is disabled for empty input or when the entered skill already exists.
 *
 * @param onAdd - Callback invoked with the skill string to add
 * @param existingSkills - Skills that are already added (excluded from suggestions)
 * @param profileSkills - User's profile skills which are prioritized in suggestions
 * @param placeholder - Input placeholder text
 * @returns The rendered skill input UI element
 */
export default function SkillInput({
  onAdd,
  existingSkills = [],
  profileSkills = [],
  placeholder = "Add a skill...",
}: SkillInputProps) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const searchTerm = value.trim().toLowerCase();
    
    if (searchTerm) {
      // Filter profile skills first (prioritized)
      const filteredProfileSkills = profileSkills.filter(
        (skill) =>
          skill.toLowerCase().includes(searchTerm) &&
          !existingSkills.includes(skill)
      );
      
      // Filter common skills
      const filteredCommonSkills = COMMON_SKILLS.filter(
        (skill) =>
          skill.toLowerCase().includes(searchTerm) &&
          !existingSkills.includes(skill) &&
          !profileSkills.includes(skill) // Don't duplicate if already in profile
      );
      
      // Combine: profile skills first, then common skills
      const combined = [...filteredProfileSkills, ...filteredCommonSkills].slice(0, 5);
      
      setSuggestions(combined);
      // Only show if there are suggestions and input has focus
      if (combined.length > 0) {
        setShowSuggestions(true);
      }
    } else {
      // When input is empty, show available profile skills (up to 5)
      const availableProfileSkills = profileSkills
        .filter((skill) => !existingSkills.includes(skill))
        .slice(0, 5);
      
      setSuggestions(availableProfileSkills);
      // Only show if there are profile skills available
      // (showSuggestions state will be controlled by focus/blur)
    }
  }, [value, existingSkills, profileSkills]);

  const handleAdd = (skillToAdd?: string) => {
    const skill = (skillToAdd || value).trim();
    if (skill && !existingSkills.includes(skill)) {
      onAdd(skill);
      setValue("");
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2 items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            // Show suggestions when focused, especially profile skills
            setShowSuggestions(true);
          }}
          onBlur={() => {
            // Delay to allow clicking on suggestions
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          className="flex-1 h-10 px-3 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 bg-white"
        />
        <Button
          type="button"
          size="sm"
          onClick={() => handleAdd()}
          disabled={!value.trim() || existingSkills.includes(value.trim())}
          className="h-10 w-10 p-0 flex items-center justify-center"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {!value.trim() && profileSkills.length > 0 && (
            <div className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border-b border-gray-200">
              Your Profile Skills (click to add)
            </div>
          )}
          {suggestions.map((suggestion, idx) => {
            const isProfileSkill = profileSkills.includes(suggestion);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleAdd(suggestion)}
                className={`w-full text-left px-3 py-2.5 hover:bg-gray-100 text-base ${
                  isProfileSkill ? "bg-blue-50 hover:bg-blue-100" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{suggestion}</span>
                  {isProfileSkill && (
                    <span className="text-xs text-blue-600 font-medium ml-2">From Profile</span>
                  )}
                </div>
              </button>
            );
          })}
          {!value.trim() && profileSkills.filter(s => !existingSkills.includes(s)).length > 5 && (
            <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
              Type to search more skills...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

