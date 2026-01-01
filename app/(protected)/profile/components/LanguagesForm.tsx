"use client";

import { logger } from "@/lib/utils/logger";

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
import { Plus, Edit, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Language {
  id: string;
  name: string;
  proficiencyLevel: string;
}

const PROFICIENCY_LEVELS = ["Native", "Fluent", "Intermediate", "Basic"] as const;

const PROFICIENCY_COLORS = {
  Native: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
  Fluent: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  Intermediate: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
  Basic: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

export default function LanguagesForm({
  profileId,
  languages,
}: {
  profileId: string;
  languages: Language[];
}) {
  const [items, setItems] = useState<Language[]>(languages);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const router = useRouter();

  const addLanguage = () => {
    setEditingLanguage({
      id: `new-${Date.now()}`,
      name: "",
      proficiencyLevel: "",
    });
    setShowAddDialog(true);
  };

  const removeLanguage = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleEditLanguage = (language: Language) => {
    setEditingLanguage({ ...language });
    setShowAddDialog(true);
  };

  const handleSaveLanguage = () => {
    if (!editingLanguage || !editingLanguage.name || !editingLanguage.proficiencyLevel) {
      return;
    }

    if (editingLanguage.id.startsWith("new-")) {
      // New language
      setItems([...items, editingLanguage]);
    } else {
      // Update existing
      setItems(
        items.map((item) =>
          item.id === editingLanguage.id ? editingLanguage : item
        )
      );
    }
    setEditingLanguage(null);
    setShowAddDialog(false);
  };

  const handleCancelEdit = () => {
    setEditingLanguage(null);
    setShowAddDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/profile/languages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          languages: items,
        }),
      });

      if (!response.ok) throw new Error("Failed to update languages");

      router.refresh();
      setIsEditMode(false);
    } catch (error) {
      logger.error("Error updating languages", error);
      alert("Failed to update languages");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setItems(languages);
    setIsEditMode(false);
  };

  // Sort languages by proficiency level (Native first, then Fluent, etc.)
  const sortedLanguages = [...items].sort((a, b) => {
    const aIndex = PROFICIENCY_LEVELS.indexOf(a.proficiencyLevel as typeof PROFICIENCY_LEVELS[number]);
    const bIndex = PROFICIENCY_LEVELS.indexOf(b.proficiencyLevel as typeof PROFICIENCY_LEVELS[number]);
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }
    // If same proficiency, sort alphabetically
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Languages</CardTitle>
            <CardDescription>
              Add languages you speak and your proficiency level
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
                <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Language
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
          {sortedLanguages.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <p className="mb-4">No languages added yet</p>
              {!isEditMode && (
                <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Language
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sortedLanguages.map((lang) => {
                const proficiencyColor = PROFICIENCY_COLORS[lang.proficiencyLevel as keyof typeof PROFICIENCY_COLORS] || PROFICIENCY_COLORS.Basic;
                
                return (
                  <Badge
                    key={lang.id}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-all text-sm px-3 py-1.5",
                      proficiencyColor,
                      isEditMode && "hover:ring-2 hover:ring-destructive/50"
                    )}
                    onClick={() => isEditMode && handleEditLanguage(lang)}
                  >
                    <span>{lang.name}</span>
                    <span className="mx-1.5">-</span>
                    <span className="font-medium">{lang.proficiencyLevel}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLanguage(lang.id);
                        }}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Language Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLanguage?.id.startsWith("new-") ? "Add Language" : "Edit Language"}
            </DialogTitle>
            <DialogDescription>
              {editingLanguage?.id.startsWith("new-")
                ? "Add a new language to your profile"
                : "Update language information"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="language-name">Language *</Label>
              <Input
                id="language-name"
                value={editingLanguage?.name || ""}
                onChange={(e) =>
                  setEditingLanguage(
                    editingLanguage
                      ? { ...editingLanguage, name: e.target.value }
                      : null
                  )
                }
                placeholder="e.g., English, Spanish, French"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language-proficiency">Proficiency Level *</Label>
              <Select
                value={editingLanguage?.proficiencyLevel || ""}
                onValueChange={(value) =>
                  setEditingLanguage(
                    editingLanguage
                      ? { ...editingLanguage, proficiencyLevel: value }
                      : null
                  )
                }
              >
                <SelectTrigger id="language-proficiency">
                  <SelectValue placeholder="Select proficiency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Native">Native</SelectItem>
                  <SelectItem value="Fluent">Fluent</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
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
              onClick={handleSaveLanguage}
              disabled={
                !editingLanguage?.name ||
                !editingLanguage?.proficiencyLevel
              }
            >
              {editingLanguage?.id.startsWith("new-") ? "Add" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
