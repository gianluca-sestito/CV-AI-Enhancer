"use client";

import { Button } from "@/components/ui/button";
import { X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillBadgeProps {
  skill: string;
  onRemove?: () => void;
  isDragging?: boolean;
  showDragHandle?: boolean;
}

export default function SkillBadge({
  skill,
  onRemove,
  isDragging = false,
  showDragHandle = false,
}: SkillBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium",
        "group hover:bg-gray-200 transition-colors",
        isDragging && "opacity-50"
      )}
    >
      {showDragHandle && (
        <GripVertical className="h-3 w-3 text-gray-400 cursor-grab active:cursor-grabbing" />
      )}
      <span>{skill}</span>
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent"
        >
          <X className="h-3 w-3 text-gray-500 hover:text-destructive" />
        </Button>
      )}
    </div>
  );
}


