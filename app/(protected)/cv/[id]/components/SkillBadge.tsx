"use client";

import { Button } from "@/components/ui/button";
import { X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DraggableAttributes } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";

// Type for listeners from useSortable - inferred from the hook return type
type SortableListeners = ReturnType<typeof useSortable>["listeners"];

interface SkillBadgeProps {
  skill: string;
  onRemove?: () => void;
  isDragging?: boolean;
  showDragHandle?: boolean;
  dragListeners?: SortableListeners;
  dragAttributes?: DraggableAttributes;
}

export default function SkillBadge({
  skill,
  onRemove,
  isDragging = false,
  showDragHandle = false,
  dragListeners,
  dragAttributes,
}: SkillBadgeProps) {
  const dragHandle = showDragHandle && dragListeners && dragAttributes;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md text-sm font-medium",
        "group hover:bg-gray-200 transition-colors",
        isDragging && "opacity-50"
      )}
      {...(dragAttributes || {})}
    >
      {dragHandle && (
        <div
          {...dragListeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-3 w-3 text-gray-400" />
        </div>
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


