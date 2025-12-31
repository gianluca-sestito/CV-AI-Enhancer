"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string | null;
    description: string;
    analysisResults: Array<{
      matchScore: number;
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <CardTitle>{job.title}</CardTitle>
              {job.company && (
                <CardDescription>{job.company}</CardDescription>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href={`/jobs/${job.id}`} className="flex-1 sm:flex-initial">
                <Button variant="outline" className="w-full sm:w-auto">
                  View
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>
          {job.analysisResults.length > 0 && (
            <div className="mt-4">
              <span className="text-sm font-medium">
                Latest Analysis: {job.analysisResults[0].matchScore}% match
              </span>
            </div>
          )}
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


