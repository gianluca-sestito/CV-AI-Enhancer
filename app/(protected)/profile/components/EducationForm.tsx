"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
  orderIndex: number;
}

export default function EducationForm({
  profileId,
  education,
}: {
  profileId: string;
  education: Education[];
}) {
  const [items, setItems] = useState<Education[]>(education);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addEducation = () => {
    setItems([
      ...items,
      {
        id: `new-${Date.now()}`,
        institution: "",
        degree: "",
        fieldOfStudy: null,
        startDate: "",
        endDate: null,
        current: false,
        description: null,
        orderIndex: items.length,
      },
    ]);
  };

  const removeEducation = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
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
      const response = await fetch("/api/profile/education", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          education: items,
        }),
      });

      if (!response.ok) throw new Error("Failed to update education");

      router.refresh();
    } catch (error) {
      console.error("Error updating education:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
        <CardDescription>
          Add your educational background
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {items.map((edu, index) => (
            <div key={edu.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Education {index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEducation(edu.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`institution-${edu.id}`}>Institution</Label>
                  <Input
                    id={`institution-${edu.id}`}
                    value={edu.institution}
                    onChange={(e) =>
                      updateEducation(edu.id, "institution", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                  <Input
                    id={`degree-${edu.id}`}
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(edu.id, "degree", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`fieldOfStudy-${edu.id}`}>Field of Study</Label>
                  <Input
                    id={`fieldOfStudy-${edu.id}`}
                    value={edu.fieldOfStudy || ""}
                    onChange={(e) =>
                      updateEducation(edu.id, "fieldOfStudy", e.target.value || null)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`startDate-${edu.id}`}>Start Date</Label>
                  <Input
                    id={`startDate-${edu.id}`}
                    type="date"
                    value={edu.startDate}
                    onChange={(e) =>
                      updateEducation(edu.id, "startDate", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`endDate-${edu.id}`}>End Date</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Input
                      id={`endDate-${edu.id}`}
                      type="date"
                      value={edu.endDate || ""}
                      onChange={(e) =>
                        updateEducation(edu.id, "endDate", e.target.value || null)
                      }
                      disabled={edu.current}
                      className="flex-1 w-full sm:w-auto"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`current-edu-${edu.id}`}
                        checked={edu.current}
                        onChange={(e) => {
                          updateEducation(edu.id, "current", e.target.checked);
                          if (e.target.checked) {
                            updateEducation(edu.id, "endDate", null);
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={`current-edu-${edu.id}`} className="text-sm">
                        Current
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${edu.id}`}>Description (Optional)</Label>
                <Textarea
                  id={`description-${edu.id}`}
                  value={edu.description || ""}
                  onChange={(e) =>
                    updateEducation(edu.id, "description", e.target.value || null)
                  }
                  rows={3}
                />
              </div>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="button" variant="outline" onClick={addEducation} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Saving..." : "Save Education"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

