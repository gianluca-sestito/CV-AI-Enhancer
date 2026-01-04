"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useProfileData } from "./useProfileData";
import {
  transformWorkExperienceToCVExperience,
  experiencesMatch,
} from "./profileDataTransformers";
import type { WorkExperience } from "@/lib/types/prisma";
import type { Experience } from "./types";

interface ProfileDataImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentExperience: Experience | null;
  onImport: (experience: Omit<Experience, "experienceId">) => void;
}

/**
 * Renders a controlled dialog that lets the user select and import a work experience from their profile into the current CV.
 *
 * The dialog fetches profile work experiences, shows loading/error/empty states, allows selecting an experience, previews the transformed CV experience (company, position, achievements), and invokes `onImport` with the transformed experience when the user confirms. If a `currentExperience` is provided, selecting an experience with a different company or position will surface a warning that the entire experience will be replaced rather than only achievements.
 *
 * @param open - Whether the dialog is open.
 * @param onOpenChange - Callback invoked with the new open state.
 * @param currentExperience - Optional existing CV experience used to compare company and position for change warnings.
 * @param onImport - Callback invoked with the transformed experience payload (without `experienceId`) when the user confirms import.
 * @returns The dialog React element for importing profile work experiences.
 */
export default function ProfileDataImportDialog({
  open,
  onOpenChange,
  currentExperience,
  onImport,
}: ProfileDataImportDialogProps) {
  const { workExperiences, isLoading, error } = useProfileData();
  const [selectedExperience, setSelectedExperience] =
    useState<WorkExperience | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Present";
    // Handle both Date objects and ISO strings
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Present";
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const handleSelectExperience = (exp: WorkExperience) => {
    setSelectedExperience(exp);
    // Check if company/position match
    if (currentExperience) {
      const matches = experiencesMatch(
        {
          company: currentExperience.company,
          position: currentExperience.position,
        },
        { company: exp.company, position: exp.position }
      );
      setShowWarning(!matches);
    } else {
      setShowWarning(false);
    }
  };

  const handleImport = () => {
    if (!selectedExperience) return;

    const transformed = transformWorkExperienceToCVExperience(selectedExperience);
    onImport(transformed);
    handleClose();
  };

  const handleClose = () => {
    setSelectedExperience(null);
    setShowWarning(false);
    onOpenChange(false);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import from Profile</DialogTitle>
            <DialogDescription>
              Loading your work experiences...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || workExperiences.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import from Profile</DialogTitle>
            <DialogDescription>
              {error
                ? "Failed to load your profile data"
                : "No work experiences found in your profile"}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import from Profile</DialogTitle>
          <DialogDescription>
            Select a work experience from your profile to import.
            {currentExperience &&
              " If company and position match, only achievements will be replaced."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {workExperiences.map((exp) => {
            const isSelected = selectedExperience?.id === exp.id;
            const dateRange = exp.current
              ? `${formatDate(exp.startDate)} — Present`
              : `${formatDate(exp.startDate)} — ${formatDate(exp.endDate)}`;

            return (
              <button
                key={exp.id}
                type="button"
                onClick={() => handleSelectExperience(exp)}
                className={`w-full text-left p-4 border rounded-lg transition-colors ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {exp.position}
                    </div>
                    <div className="text-sm text-gray-600">{exp.company}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {dateRange}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-blue-600 font-medium text-sm">
                      Selected
                    </div>
                  )}
                </div>
                {exp.description && (
                  <div className="mt-2 text-sm text-gray-700 line-clamp-2">
                    {exp.description.substring(0, 150)}
                    {exp.description.length > 150 ? "..." : ""}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {showWarning && currentExperience && selectedExperience && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              The selected experience has a different company or position than
              the current one. This will replace the entire experience, not just
              the achievements.
            </AlertDescription>
          </Alert>
        )}

        {selectedExperience && (
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-gray-900 mb-2">
              Preview:
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <div>
                <span className="font-medium">Company:</span>{" "}
                {selectedExperience.company}
              </div>
              <div>
                <span className="font-medium">Position:</span>{" "}
                {selectedExperience.position}
              </div>
              <div>
                <span className="font-medium">Achievements:</span>
                <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5">
                  {transformWorkExperienceToCVExperience(
                    selectedExperience
                  ).achievements.map((achievement, idx) => (
                    <li key={idx} className="text-gray-600">
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedExperience}
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
