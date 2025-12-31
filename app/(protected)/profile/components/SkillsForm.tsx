"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category: string | null;
  proficiencyLevel: string | null;
}

export default function SkillsForm({
  profileId,
  skills,
}: {
  profileId: string;
  skills: Skill[];
}) {
  const [items, setItems] = useState<Skill[]>(skills);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addSkill = () => {
    setItems([
      ...items,
      {
        id: `new-${Date.now()}`,
        name: "",
        category: null,
        proficiencyLevel: null,
      },
    ]);
  };

  const removeSkill = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateSkill = (id: string, field: keyof Skill, value: any) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
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
    } catch (error) {
      console.error("Error updating skills:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>
          Add your skills and proficiency levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {items.map((skill) => (
            <div key={skill.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`skill-name-${skill.id}`}>Skill Name</Label>
                <Input
                  id={`skill-name-${skill.id}`}
                  value={skill.name}
                  onChange={(e) =>
                    updateSkill(skill.id, "name", e.target.value)
                  }
                  placeholder="e.g., JavaScript, Python"
                  required
                />
              </div>

              <div className="w-full sm:w-48 space-y-2">
                <Label htmlFor={`category-${skill.id}`}>Category</Label>
                <Select
                  value={skill.category || ""}
                  onValueChange={(value) =>
                    updateSkill(skill.id, "category", value || null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                    <SelectItem value="Languages">Languages</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-48 space-y-2">
                <Label htmlFor={`proficiency-${skill.id}`}>Proficiency</Label>
                <Select
                  value={skill.proficiencyLevel || ""}
                  onValueChange={(value) =>
                    updateSkill(skill.id, "proficiencyLevel", value || null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSkill(skill.id)}
                className="self-start sm:self-end"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="button" variant="outline" onClick={addSkill} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Saving..." : "Save Skills"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

