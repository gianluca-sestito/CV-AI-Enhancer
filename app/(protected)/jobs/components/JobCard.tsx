"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trash2,
  Building2,
  Calendar,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string | null;
    description: string;
    createdAt: Date;
    analysisResults: Array<{
      matchScore: number;
      status: string;
      completedAt: Date | null;
    }>;
  };
}

export default function JobCard({ job }: JobCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete job description");

      router.refresh();
    } catch (error) {
      logger.error("Error deleting job description", error);
      alert("Failed to delete job description");
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const latestAnalysis = job.analysisResults[0] || null;
  const matchScore = latestAnalysis?.matchScore;

  const getMatchScoreColor = (score: number | undefined) => {
    if (score === undefined) return "secondary";
    if (score >= 70) return "default";
    if (score >= 50) return "secondary";
    return "outline";
  };

  const getMatchScoreBarColor = (score: number | undefined) => {
    if (score === undefined) return "bg-muted";
    if (score >= 70) return "bg-green-600";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />;
      case "processing":
        return <Clock className="h-3.5 w-3.5 text-blue-600 animate-pulse" />;
      case "failed":
        return <XCircle className="h-3.5 w-3.5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card variant="elevated" hover className="group">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-mesh flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-2xl mb-2">
                    {job.title}
                  </CardTitle>
                  {job.company && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span className="text-base">{job.company}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto">
              {latestAnalysis && matchScore !== undefined && (
                <div className="flex-1 lg:flex-none">
                  <div className="text-center">
                    <div className={cn(
                      "text-4xl font-display font-bold mb-1",
                      matchScore >= 70 ? "text-cv-match-high" :
                      matchScore >= 50 ? "text-cv-match-medium" : "text-cv-match-low"
                    )}>
                      {matchScore}%
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Match Score
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Link href={`/jobs/${job.id}`} className="flex-1 lg:flex-none">
                  <Button variant="default" size="sm" className="w-full">
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Match Score Progress */}
          {latestAnalysis ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Analysis Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(latestAnalysis.status)}
                  {latestAnalysis.status && (
                    <span className="text-xs text-muted-foreground capitalize">
                      {latestAnalysis.status}
                    </span>
                  )}
                </div>
              </div>
              {matchScore !== undefined && (
                <Progress
                  value={matchScore}
                  variant="match"
                  showPercentage={false}
                />
              )}
            </div>
          ) : (
            <div className="bg-muted/50 border border-dashed border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  <span>Not analyzed yet</span>
                </div>
                <Link href={`/jobs/${job.id}`}>
                  <Button variant="outline" size="sm">
                    Analyze Now
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border/50">
            <Calendar className="h-3.5 w-3.5" />
            <span>Added {formatDate(job.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Description</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{job.title}"? This action cannot be undone.
              All associated analysis results and CVs will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
