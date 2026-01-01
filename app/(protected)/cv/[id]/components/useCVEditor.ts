"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { CVData } from "./types";
import { logger } from "@/lib/utils/logger";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseCVEditorReturn {
  cvData: CVData | null;
  isEditing: boolean;
  toggleEdit: () => void;
  updateCVData: (updater: (data: CVData) => CVData) => void;
  saveStatus: SaveStatus;
  isDirty: boolean;
  saveNow: () => Promise<void>;
}

export function useCVEditor(
  cvId: string,
  initialData: CVData | null
): UseCVEditorReturn {
  const [cvData, setCvData] = useState<CVData | null>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isDirty, setIsDirty] = useState(false);
  const initialDataRef = useRef<CVData | null>(initialData);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update local data when initial data changes (from server)
  useEffect(() => {
    if (initialData) {
      initialDataRef.current = initialData;
      setCvData(initialData);
      setIsDirty(false);
    }
  }, [initialData]);

  // Debounced save function
  const debouncedSave = useDebouncedCallback(
    async (data: CVData) => {
      if (!data) return;

      setSaveStatus("saving");
      try {
        const response = await fetch(`/api/cv/${cvId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ structuredContent: data }),
        });

        if (!response.ok) {
          throw new Error("Failed to save CV");
        }

        const updated = await response.json();
        if (updated.structuredContent) {
          initialDataRef.current = updated.structuredContent;
          setCvData(updated.structuredContent);
          setIsDirty(false);
        }

        setSaveStatus("saved");
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        logger.error("Error saving CV", error, { cvId });
        setSaveStatus("error");
        // Reset to idle after 3 seconds on error
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    },
    500 // 500ms debounce
  );

  // Update CV data and trigger save
  const updateCVData = useCallback(
    (updater: (data: CVData) => CVData) => {
      setCvData((current) => {
        if (!current) return current;
        const updated = updater(current);
        setIsDirty(true);
        debouncedSave(updated);
        return updated;
      });
    },
    [debouncedSave]
  );

  // Manual save function (for explicit saves)
  const saveNow = useCallback(async () => {
    if (!cvData || !isDirty) return;

    // Cancel any pending debounced save
    debouncedSave.cancel();

    setSaveStatus("saving");
    try {
      const response = await fetch(`/api/cv/${cvId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ structuredContent: cvData }),
      });

      if (!response.ok) {
        throw new Error("Failed to save CV");
      }

      const updated = await response.json();
      if (updated.structuredContent) {
        initialDataRef.current = updated.structuredContent;
        setCvData(updated.structuredContent);
        setIsDirty(false);
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      logger.error("Error saving CV", error, { cvId });
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [cvData, cvId, isDirty, debouncedSave]);

  const toggleEdit = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [debouncedSave]);

  return {
    cvData,
    isEditing,
    toggleEdit,
    updateCVData,
    saveStatus,
    isDirty,
    saveNow,
  };
}


