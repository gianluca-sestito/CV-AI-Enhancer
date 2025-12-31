"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionHeader,
} from "@/components/ui/accordion";
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
import { Edit, Trash2, Save, X } from "lucide-react";
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

  return (
    <>
      <Accordion type="single" collapsible defaultValue={undefined} className="w-full">
        <AccordionItem value="job-description" className="border rounded-lg">
          <AccordionHeader className="flex items-center justify-between px-4 sm:px-6 py-0">
            <AccordionPrimitive.Trigger
              className={cn(
                "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
                "hover:no-underline"
              )}
            >
              <div className="text-left">
                <h3 className="font-semibold">Job Description</h3>
                {job.company && (
                  <p className="text-sm text-muted-foreground">at {job.company}</p>
                )}
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
            <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
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
          </AccordionHeader>
          <AccordionContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            {isEditing ? (
              <div className="space-y-4 pt-4">
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
              <div className="whitespace-pre-wrap text-sm pt-4">{job.description}</div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
