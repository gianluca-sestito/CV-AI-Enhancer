"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { logger } from "@/lib/utils/logger";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Edit, Eye, Check, AlertCircle, Menu, X } from "lucide-react";
import { useCVEditor } from "./useCVEditor";
import { CVStyleProvider } from "./CVStyleProvider";
import CVContent from "./CVContent";
import type { CVData } from "./types";
import { Loading } from "@/components/ui/loading";

// Lazy load the CV editor sidebar
const CVEditorSidebar = dynamic(() => import("./CVEditorSidebar"), {
  loading: () => <Loading text="Loading editor..." />,
  ssr: false,
});

interface GeneratedCV {
  id: string;
  markdownContent?: string | null;
  structuredContent?: CVData | null;
  status: string;
  jobDescription: {
    title: string;
    company: string | null;
  };
}

export default function CVView({ cv: initialCV }: { cv: GeneratedCV }) {
  const [cv, setCV] = useState(initialCV);
  const [loading, setLoading] = useState(cv.status === "processing");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const {
    cvData,
    isEditing,
    toggleEdit,
    updateCVData,
    saveStatus,
    isDirty,
  } = useCVEditor(cv.id, initialCV.structuredContent || null);

  // Poll for CV updates if processing with exponential backoff
  useEffect(() => {
    if (cv.status === "processing") {
      let attempt = 0;
      const maxAttempts = 150; // ~5 minutes max (150 * 2s = 300s)
      const baseDelay = 2000; // 2 seconds
      const maxDelay = 30000; // 30 seconds max
      const abortController = new AbortController();

      const poll = async () => {
        if (attempt >= maxAttempts) {
          logger.warn("CV polling timeout", { cvId: cv.id, attempts: attempt });
          setLoading(false);
          return;
        }

        try {
          const response = await fetch(`/api/cv/${cv.id}`, {
            signal: abortController.signal,
          });

          if (response.ok) {
            const data = await response.json();
            setCV(data);
            if (data.status === "completed" || data.status === "failed") {
              setLoading(false);
              return;
            }
          }

          // Calculate exponential backoff: 2s, 4s, 8s, 16s, 30s (max)
          const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
          attempt++;
          setTimeout(poll, delay);
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            return; // Component unmounted, stop polling
          }
          logger.error("Error fetching CV", error, { cvId: cv.id, attempt });
          
          // Continue polling on error with backoff
          const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
          attempt++;
          setTimeout(poll, delay);
        }
      };

      // Start polling
      poll();

      return () => {
        abortController.abort();
      };
    }
  }, [cv.id, cv.status]);

  const handleDownloadPDF = useCallback(() => {
    window.open(`/api/cv/${cv.id}/pdf`, "_blank");
  }, [cv.id]);

  const handleEditToggle = useCallback(() => {
    toggleEdit();
    setSidebarOpen((prev) => !prev);
  }, [toggleEdit]);

  const getSaveStatusIcon = useCallback(() => {
    switch (saveStatus) {
      case "saving":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "saved":
        return <Check className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  }, [saveStatus]);

  const getSaveStatusText = useCallback(() => {
    switch (saveStatus) {
      case "saving":
        return "Saving...";
      case "saved":
        return "Saved";
      case "error":
        return "Error saving";
      default:
        return isDirty ? "Unsaved changes" : "";
    }
  }, [saveStatus, isDirty]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Generating your CV...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cv.status === "failed") {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Card>
          <CardContent className="py-6">
            <h2 className="text-xl font-bold mb-2">CV Generation Failed</h2>
            <p className="text-destructive mb-4">
              The CV could not be generated. Please try again.
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Card>
          <CardContent className="py-6">
            <h2 className="text-xl font-bold mb-2">CV Not Available</h2>
            <p className="text-muted-foreground mb-4">
              This CV does not have structured content. Please regenerate it.
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <CVStyleProvider cvId={cv.id}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        {isEditing && (
          <CVEditorSidebar
            cvId={cv.id}
            cvData={cvData}
            updateCVData={updateCVData}
            onClose={() => {
              setSidebarOpen(false);
              toggleEdit();
            }}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b bg-white shrink-0">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {isEditing ? "CV Editor" : "CV Preview"}
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Tailored for {cv.jobDescription.title}
                    {cv.jobDescription.company && ` at ${cv.jobDescription.company}`}
                  </p>
                </div>
                <div className="flex gap-2 items-center w-full sm:w-auto">
                  {isEditing && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
                      {getSaveStatusIcon()}
                      <span>{getSaveStatusText()}</span>
                    </div>
                  )}
                  <Button
                    onClick={handleEditToggle}
                    variant={isEditing ? "outline" : "default"}
                    className="w-full sm:w-auto"
                  >
                    {isEditing ? (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    variant="default"
                    className="w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* CV Preview */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Card>
                <CardContent className="p-6 sm:p-8 lg:p-12 print:p-0">
                  <CVContent cvData={cvData} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </CVStyleProvider>
  );
}
