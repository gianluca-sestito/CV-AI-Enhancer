"use client";

import { useState } from "react";
import { X, Save, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ContentEditor from "./sidebar/ContentEditor";
import LayoutEditor from "./sidebar/LayoutEditor";
import TypographyEditor from "./sidebar/TypographyEditor";
import ColorsEditor from "./sidebar/ColorsEditor";
import SpacingEditor from "./sidebar/SpacingEditor";
import { useCVStyleContext } from "./CVStyleProvider";
import type { CVData } from "./types";

interface CVEditorSidebarProps {
  cvId: string;
  cvData: CVData | null;
  updateCVData: (updater: (data: CVData) => CVData) => void;
  onClose?: () => void;
}

export default function CVEditorSidebar({
  cvId,
  cvData,
  updateCVData,
  onClose,
}: CVEditorSidebarProps) {
  const { saveStylesToDatabase } = useCVStyleContext();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!cvData) return null;

  const handleSaveStyles = async () => {
    setSaveStatus("saving");
    setSaveError(null);

    const result = await saveStylesToDatabase();

    if (result.success) {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } else {
      setSaveStatus("error");
      setSaveError(result.error || "Failed to save styles");
      setTimeout(() => {
        setSaveStatus("idle");
        setSaveError(null);
      }, 3000);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-[380px] bg-white border-r border-gray-200 z-50 md:relative md:z-auto flex flex-col shadow-lg md:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-semibold">Edit CV</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveStyles}
              disabled={saveStatus === "saving"}
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : saveStatus === "success" ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Saved
                </>
              ) : saveStatus === "error" ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Error
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save Styles
                </>
              )}
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="md:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {saveError && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-sm text-red-700">
            {saveError}
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <Accordion type="multiple" defaultValue={["content"]} className="w-full">
              <AccordionItem value="content">
                <AccordionTrigger>Content</AccordionTrigger>
                <AccordionContent>
                  <ContentEditor cvData={cvData} updateCVData={updateCVData} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="layout">
                <AccordionTrigger>Layout</AccordionTrigger>
                <AccordionContent>
                  <LayoutEditor cvData={cvData} updateCVData={updateCVData} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="typography">
                <AccordionTrigger>Typography</AccordionTrigger>
                <AccordionContent>
                  <TypographyEditor />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="colors">
                <AccordionTrigger>Colors</AccordionTrigger>
                <AccordionContent>
                  <ColorsEditor />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="spacing">
                <AccordionTrigger>Spacing</AccordionTrigger>
                <AccordionContent>
                  <SpacingEditor />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
}

