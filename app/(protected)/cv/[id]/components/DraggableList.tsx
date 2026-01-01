"use client";

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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";
import type { DraggableAttributes } from "@dnd-kit/core";

// Type for listeners from useSortable - inferred from the hook return type
type SortableListeners = ReturnType<typeof useSortable>["listeners"];

interface DraggableListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  children: (
    item: T,
    index: number,
    attributes: DraggableAttributes,
    listeners: SortableListeners | undefined,
    isDragging: boolean
  ) => ReactNode;
  itemId: (item: T, index: number) => string;
}

export function DraggableList<T>({
  items,
  onReorder,
  children,
  itemId,
}: DraggableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item, idx) => itemId(item, idx) === active.id);
      const newIndex = items.findIndex((item, idx) => itemId(item, idx) === over.id);

      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item, idx) => itemId(item, idx))}
        strategy={verticalListSortingStrategy}
      >
        {items.map((item, index) => (
          <SortableItem
            key={itemId(item, index)}
            id={itemId(item, index)}
            item={item}
            index={index}
            render={children}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

interface SortableItemProps<T> {
  id: string;
  item: T;
  index: number;
  render: (
    item: T,
    index: number,
    attributes: DraggableAttributes,
    listeners: SortableListeners | undefined,
    isDragging: boolean
  ) => ReactNode;
}

function SortableItem<T>({ id, item, index, render }: SortableItemProps<T>) {
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
      {render(item, index, attributes, listeners, isDragging)}
    </div>
  );
}

