"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import JobSidebar from "./JobSidebar";

interface JobSidebarClientProps {
  job: {
    id: string;
    title: string;
    company: string | null;
    createdAt: Date;
  };
  analysis: {
    matchScore?: number;
    status?: string;
    completedAt?: Date | null;
    createdAt?: Date;
  } | null;
  hasAnalysis: boolean;
  hasCVs: boolean;
  jobDescription: string;
  analysisResultId?: string;
}

export default function JobSidebarClient({
  job,
  analysis,
  hasAnalysis,
  hasCVs,
  jobDescription,
  analysisResultId,
}: JobSidebarClientProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingCV, setGeneratingCV] = useState(false);
  const router = useRouter();

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescriptionId: job.id,
          jobDescription: jobDescription,
        }),
      });

      if (!response.ok) throw new Error("Failed to start analysis");
      router.refresh();
    } catch (error) {
      console.error("Error starting analysis:", error);
      alert("Failed to start analysis. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRedoAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescriptionId: job.id,
          jobDescription: jobDescription,
        }),
      });

      if (!response.ok) throw new Error("Failed to redo analysis");
      router.refresh();
    } catch (error) {
      console.error("Error redoing analysis:", error);
      alert("Failed to redo analysis. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateCV = async () => {
    if (!analysisResultId) return;
    
    setGeneratingCV(true);
    try {
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescriptionId: job.id,
          analysisResultId: analysisResultId,
          jobDescription: jobDescription,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate CV");
      const data = await response.json();
      router.push(`/cv/${data.id}`);
    } catch (error) {
      console.error("Error generating CV:", error);
      alert("Failed to generate CV. Please try again.");
    } finally {
      setGeneratingCV(false);
    }
  };

  return (
    <JobSidebar
      job={job}
      analysis={analysis}
      hasAnalysis={hasAnalysis}
      hasCVs={hasCVs}
      onAnalyze={!hasAnalysis ? handleAnalyze : undefined}
      onRedoAnalysis={hasAnalysis ? handleRedoAnalysis : undefined}
      onGenerateCV={hasAnalysis ? handleGenerateCV : undefined}
      analyzing={analyzing}
      generatingCV={generatingCV}
    />
  );
}

