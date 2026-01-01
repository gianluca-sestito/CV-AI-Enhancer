"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Edit, Eye, Check, AlertCircle, Menu, X } from "lucide-react";
import { useCVEditor } from "./useCVEditor";
import { CVStyleProvider } from "./CVStyleProvider";
import CVEditorSidebar from "./CVEditorSidebar";
import CvLayout from "./CvLayout";
import CvHeader from "./CvHeader";
import CvSection from "./CvSection";
import ExperienceItem from "./ExperienceItem";
import SkillsSection from "./SkillsSection";
import LanguageSection from "./LanguageSection";
import type { CVData } from "./types";

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

  // Poll for CV updates if processing
  useEffect(() => {
    if (cv.status === "processing") {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/cv/${cv.id}`);
          if (response.ok) {
            const data = await response.json();
            setCV(data);
            if (data.status === "completed" || data.status === "failed") {
              setLoading(false);
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error("Error fetching CV:", error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [cv.id, cv.status]);

  const handleDownloadPDF = () => {
    window.open(`/api/cv/${cv.id}/pdf`, "_blank");
  };

  const handleEditToggle = () => {
    toggleEdit();
    setSidebarOpen(!sidebarOpen);
  };

  const getSaveStatusIcon = () => {
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
  };

  const getSaveStatusText = () => {
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
  };

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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                  <CvLayout>
                    <CvHeader header={cvData.header} />

                    {cvData.summary && (
                      <CvSection title="Summary" sectionKey="summary">
                        <p style={{ lineHeight: "1.6" }}>{cvData.summary}</p>
                      </CvSection>
                    )}

                    {cvData.experiences && cvData.experiences.length > 0 && (
                      <CvSection title="Professional Experience" sectionKey="experience">
                        {cvData.experiences.map((experience) => (
                          <ExperienceItem
                            key={experience.experienceId}
                            experience={experience}
                          />
                        ))}
                      </CvSection>
                    )}

                    {cvData.skillGroups && cvData.skillGroups.length > 0 && (
                      <CvSection title="Technical Skills" sectionKey="skills">
                        <SkillsSection skillGroups={cvData.skillGroups} />
                      </CvSection>
                    )}

                    {cvData.education && cvData.education.length > 0 && (
                      <CvSection title="Education" sectionKey="education">
                        <div className="space-y-4 print:space-y-3">
                          {cvData.education.map((edu, idx) => {
                            const formatDate = (dateString: string) => {
                              const date = new Date(dateString);
                              return date.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                              });
                            };
                            const dateRange =
                              edu.current || !edu.endDate
                                ? `${formatDate(edu.startDate)} — Present`
                                : `${formatDate(edu.startDate)} — ${formatDate(edu.endDate)}`;

                            return (
                              <div key={idx} className="mb-4 print:mb-3">
                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                                  <div>
                                    <span className="font-semibold text-gray-900">
                                      {edu.degree}
                                    </span>
                                    {edu.fieldOfStudy && (
                                      <span className="text-gray-600">
                                        {" "}
                                        in {edu.fieldOfStudy}
                                      </span>
                                    )}
                                    <span className="text-gray-600"> · {edu.institution}</span>
                                  </div>
                                  <span className="text-sm text-gray-500">{dateRange}</span>
                                </div>
                                {edu.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {edu.description}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CvSection>
                    )}

                    {cvData.languages && cvData.languages.length > 0 && (
                      <CvSection title="Languages" sectionKey="languages">
                        <LanguageSection languages={cvData.languages} />
                      </CvSection>
                    )}
                  </CvLayout>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </CVStyleProvider>
  );
}
