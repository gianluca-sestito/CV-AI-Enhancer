"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  onSave?: () => void;
}

export default function EditableText({
  value,
  onChange,
  multiline = false,
  className,
  placeholder = "Click to edit...",
  disabled = false,
  onSave,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Update edit value when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    if (editValue !== value) {
      setIsSaving(true);
      onChange(editValue);
      onSave?.();
      // Reset saving state after a brief delay
      setTimeout(() => setIsSaving(false), 300);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Enter" && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (disabled || !isEditing) {
    return (
      <div
        onClick={handleClick}
        className={cn(
          "cursor-text hover:bg-gray-50 rounded px-1 py-0.5 transition-colors",
          "group relative",
          disabled && "cursor-not-allowed hover:bg-transparent",
          className
        )}
      >
        {value || (
          <span className="text-gray-400 italic">{placeholder}</span>
        )}
        {isSaving && (
          <Loader2 className="absolute -right-6 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-gray-400" />
        )}
        {!disabled && (
          <span className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 ml-2">
            Click to edit
          </span>
        )}
      </div>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full min-h-[60px] p-2 border border-blue-500 rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
          "resize-y",
          className
        )}
        placeholder={placeholder}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full p-1 border border-blue-500 rounded-md",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
        className
      )}
      placeholder={placeholder}
    />
  );
}


