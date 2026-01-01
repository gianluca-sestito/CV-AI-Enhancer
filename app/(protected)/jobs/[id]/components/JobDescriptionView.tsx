"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2, Save, X, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobDescription {
  id: string;
  title: string;
  company: string | null;
  description: string;
}

export default function JobDescriptionView({
  job: initialJob,
}: {
  job: JobDescription;
}) {
  const [job, setJob] = useState(initialJob);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [editForm, setEditForm] = useState({
    title: job.title,
    company: job.company || "",
    description: job.description,
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      title: job.title,
      company: job.company || "",
      description: job.description,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      title: job.title,
      company: job.company || "",
      description: job.description,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          company: editForm.company || null,
          description: editForm.description,
        }),
      });

      if (!response.ok) throw new Error("Failed to update job description");

      const updated = await response.json();
      setJob(updated);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating job description:", error);
      alert("Failed to update job description");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete job description");

      router.push("/jobs");
      router.refresh();
    } catch (error) {
      console.error("Error deleting job description:", error);
      alert("Failed to delete job description");
      setIsDeleting(false);
    }
  };

  // Calculate if description is long enough to need truncation
  const descriptionLines = job.description.split('\n');
  const needsTruncation = descriptionLines.length > 8 || job.description.length > 500;

  return (
    <>
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Job Description
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleEdit}
                  className="h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  className="h-8 w-8"
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleSave}
                  className="h-8 w-8"
                  disabled={loading}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Job Title *</Label>
                  <Input
                    id="edit-title"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    value={editForm.company}
                    onChange={(e) =>
                      setEditForm({ ...editForm, company: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Job Description *</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={12}
                  required
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div
                className={cn(
                  "prose prose-sm max-w-none whitespace-pre-wrap text-sm lg:text-base leading-relaxed text-foreground transition-all duration-300",
                  !isExpanded && needsTruncation && "max-h-96 overflow-hidden"
                )}
              >
                {job.description}
              </div>
              {!isExpanded && needsTruncation && (
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card via-card/95 to-transparent pointer-events-none" />
              )}
              {needsTruncation && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="gap-2"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show More
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Description</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job description? This action cannot be undone.
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
