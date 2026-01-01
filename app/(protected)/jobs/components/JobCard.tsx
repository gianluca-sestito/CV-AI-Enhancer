"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

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
      console.error("Error deleting job description:", error);
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
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 mb-2">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl font-semibold mb-1.5">
                    {job.title}
                  </CardTitle>
                  {job.company && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{job.company}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {latestAnalysis && matchScore !== undefined && (
                <Badge
                  variant={getMatchScoreColor(matchScore) as any}
                  className="text-lg px-4 py-1.5 font-semibold"
                >
                  {matchScore}%
                </Badge>
              )}
              <div className="flex gap-1.5">
                <Link href={`/jobs/${job.id}`}>
                  <Button variant="outline" size="sm" className="h-8">
                    View
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive hover:text-destructive h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {/* Featured Match Score Section */}
          {latestAnalysis ? (
            <div className="bg-muted/30 border border-border/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Match Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(latestAnalysis.status)}
                  {latestAnalysis.status && latestAnalysis.status !== "completed" && (
                    <span className="text-xs text-muted-foreground">
                      {latestAnalysis.status}
                    </span>
                  )}
                </div>
              </div>
              {matchScore !== undefined && (
                <div className="space-y-1.5">
                  <div className="w-full bg-background/50 rounded-full h-3 border border-border/30">
                    <div
                      className={cn(
                        "h-3 rounded-full transition-all",
                        getMatchScoreBarColor(matchScore)
                      )}
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>No analysis yet</span>
              </div>
            </div>
          )}

          {/* Created Date - More Subtle */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
            <Calendar className="h-3 w-3" />
            <span>Created {formatDate(job.createdAt)}</span>
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
