"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, Calendar, Sparkles, ExternalLink, Trash2 } from "lucide-react";
import type { ProfileWithRelations, AnalysisResult } from "@/lib/types";
import { logger } from "@/lib/utils/logger";

interface JobDescription {
  id: string;
  title: string;
  description: string;
}

type Profile = ProfileWithRelations;

interface GeneratedCV {
  id: string;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
}

export default function CVGenerator({
  job,
  analysis,
  profile,
  existingCVs = [],
}: {
  job: JobDescription;
  analysis: AnalysisResult;
  profile: Profile;
  existingCVs?: GeneratedCV[];
}) {
  const [loading, setLoading] = useState(false);
  const [deletingCVId, setDeletingCVId] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescriptionId: job.id,
          analysisResultId: analysis.id,
          jobDescription: job.description,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate CV");

      const data = await response.json();
      router.push(`/cv/${data.id}`);
    } catch (error) {
      logger.error("Error generating CV", error);
      alert("Failed to generate CV. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cvId: string) => {
    if (!confirm("Are you sure you want to delete this CV? This action cannot be undone.")) {
      return;
    }

    setDeletingCVId(cvId);

    try {
      const response = await fetch(`/api/cv/${cvId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete CV");
      }

      // Refresh the page to update the CV list
      router.refresh();
    } catch (error) {
      logger.error("Error deleting CV", error);
      alert(error instanceof Error ? error.message : "Failed to delete CV. Please try again.");
    } finally {
      setDeletingCVId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="text-xs">Completed</Badge>;
      case "processing":
        return <Badge variant="secondary" className="text-xs">Processing</Badge>;
      case "failed":
        return <Badge variant="destructive" className="text-xs">Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          CV Generation
        </CardTitle>
        <CardDescription>
          Generate a tailored CV based on this job description
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {existingCVs.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Existing CVs
            </h3>
            <div className="space-y-3">
              {existingCVs.map((cv) => (
                <div
                  key={cv.id}
                  className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {getStatusBadge(cv.status)}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(cv.createdAt)}
                        </span>
                      </div>
                      {cv.status === "completed" && cv.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          Completed {formatDate(cv.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {cv.status === "completed" && (
                      <Link href={`/cv/${cv.id}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3 w-3 mr-1.5" />
                          View
                        </Button>
                      </Link>
                    )}
                    {cv.status === "processing" && (
                      <Button variant="outline" size="sm" disabled>
                        Processing...
                      </Button>
                    )}
                    {cv.status === "failed" && (
                      <Link href={`/cv/${cv.id}`}>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cv.id)}
                      disabled={deletingCVId === cv.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className={`h-3 w-3 ${deletingCVId === cv.id ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full sm:w-auto"
          size="lg"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {loading ? "Generating CV..." : "Generate New CV"}
        </Button>
      </CardContent>
    </Card>
  );
}
