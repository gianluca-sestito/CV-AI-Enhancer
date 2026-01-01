"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Code, Wrench, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Skill {
  id: string;
  name: string;
  category: string | null;
  proficiencyLevel: string | null;
}

type SkillCategory = "Technical" | "Soft Skills" | "Programming Language";

const CATEGORIES: SkillCategory[] = ["Technical", "Soft Skills", "Programming Language"];

const PROFICIENCY_LEVELS = ["Expert", "Advanced", "Intermediate", "Beginner"] as const;

const CATEGORY_ICONS = {
  "Programming Language": Code,
  "Technical": Wrench,
  "Soft Skills": Users,
};

const PROFICIENCY_COLORS = {
  Expert: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
  Advanced: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  Intermediate: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
  Beginner: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

export default function SkillsForm({
  profileId,
  skills,
}: {
  profileId: string;
  skills: Skill[];
}) {
  const [items, setItems] = useState<Skill[]>(skills);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const router = useRouter();

  // Group skills by category
  const skillsByCategory = items.reduce((acc, skill) => {
    const category = (skill.category as SkillCategory) || null;
    if (!category || !CATEGORIES.includes(category)) return acc;
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<SkillCategory, Skill[]>);

  // Group skills by proficiency within a category
  const groupByProficiency = (categorySkills: Skill[]) => {
    return categorySkills.reduce((acc, skill) => {
      const level = (skill.proficiencyLevel as typeof PROFICIENCY_LEVELS[number]) || null;
      if (!level || !PROFICIENCY_LEVELS.includes(level)) return acc;
      
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(skill);
      return acc;
    }, {} as Record<typeof PROFICIENCY_LEVELS[number], Skill[]>);
  };

  const addSkill = () => {
    setEditingSkill({
      id: `new-${Date.now()}`,
      name: "",
      category: null,
      proficiencyLevel: null,
    });
    setShowAddDialog(true);
  };

  const removeSkill = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill({ ...skill });
    setShowAddDialog(true);
  };

  const handleSaveSkill = () => {
    if (!editingSkill || !editingSkill.name || !editingSkill.category || !editingSkill.proficiencyLevel) {
      return;
    }

    if (editingSkill.id.startsWith("new-")) {
      // New skill
      setItems([...items, editingSkill]);
    } else {
      // Update existing
      setItems(
        items.map((item) =>
          item.id === editingSkill.id ? editingSkill : item
        )
      );
    }
    setEditingSkill(null);
    setShowAddDialog(false);
  };

  const handleCancelEdit = () => {
    setEditingSkill(null);
    setShowAddDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/profile/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          skills: items,
        }),
      });

      if (!response.ok) throw new Error("Failed to update skills");

      router.refresh();
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating skills:", error);
      alert("Failed to update skills");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setItems(skills);
    setIsEditMode(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Skills</CardTitle>
            <CardDescription>
              Manage your skills organized by category and proficiency level
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!isEditMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category];
              const categorySkills = skillsByCategory[category] || [];
              const proficiencyGroups = groupByProficiency(categorySkills);

              return (
                <div key={category} className="space-y-4 border-r last:border-r-0 pr-6 last:pr-0 md:border-r md:last:border-r-0">
                  <div className="flex items-center gap-2 pb-3 border-b">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">{category}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {PROFICIENCY_LEVELS.map((level) => {
                      const levelSkills = proficiencyGroups[level] || [];
                      const sortedSkills = [...levelSkills].sort((a, b) =>
                        a.name.localeCompare(b.name)
                      );

                      return (
                        <div key={level} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {level}
                            </span>
                            {sortedSkills.length === 0 && (
                              <span className="text-xs text-muted-foreground italic">
                                No {level.toLowerCase()} skills
                              </span>
                            )}
                          </div>
                          {sortedSkills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {sortedSkills.map((skill) => (
                                <Badge
                                  key={skill.id}
                                  variant="outline"
                                  className={cn(
                                    "cursor-pointer transition-all",
                                    PROFICIENCY_COLORS[level],
                                    isEditMode && "hover:ring-2 hover:ring-destructive/50"
                                  )}
                                  onClick={() => isEditMode && handleEditSkill(skill)}
                                >
                                  <span className="mr-1">{skill.name}</span>
                                  {isEditMode && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeSkill(skill.id);
                                      }}
                                      className="ml-1 hover:text-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  )}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {categorySkills.length === 0 && (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        <p>No skills in this category</p>
                        {isEditMode && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={addSkill}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Skill
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Skill Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSkill?.id.startsWith("new-") ? "Add Skill" : "Edit Skill"}
            </DialogTitle>
            <DialogDescription>
              {editingSkill?.id.startsWith("new-")
                ? "Add a new skill to your profile"
                : "Update skill information"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Skill Name *</Label>
              <Input
                id="skill-name"
                value={editingSkill?.name || ""}
                onChange={(e) =>
                  setEditingSkill(
                    editingSkill
                      ? { ...editingSkill, name: e.target.value }
                      : null
                  )
                }
                placeholder="e.g., JavaScript, Python, Leadership"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill-category">Category *</Label>
              <Select
                value={editingSkill?.category || ""}
                onValueChange={(value) =>
                  setEditingSkill(
                    editingSkill
                      ? { ...editingSkill, category: value }
                      : null
                  )
                }
              >
                <SelectTrigger id="skill-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                  <SelectItem value="Programming Language">
                    Programming Language
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill-proficiency">Proficiency Level *</Label>
              <Select
                value={editingSkill?.proficiencyLevel || ""}
                onValueChange={(value) =>
                  setEditingSkill(
                    editingSkill
                      ? { ...editingSkill, proficiencyLevel: value }
                      : null
                  )
                }
              >
                <SelectTrigger id="skill-proficiency">
                  <SelectValue placeholder="Select proficiency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveSkill}
              disabled={
                !editingSkill?.name ||
                !editingSkill?.category ||
                !editingSkill?.proficiencyLevel
              }
            >
              {editingSkill?.id.startsWith("new-") ? "Add" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
