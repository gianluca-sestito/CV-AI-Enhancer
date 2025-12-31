"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  orderIndex: number;
}

export default function WorkExperienceForm({
  profileId,
  experiences,
}: {
  profileId: string;
  experiences: WorkExperience[];
}) {
  // Normalize dates to strings and ensure current is boolean
  const normalizedExperiences = experiences.map((exp) => ({
    ...exp,
    startDate: exp.startDate ? (typeof exp.startDate === 'string' ? exp.startDate : new Date(exp.startDate).toISOString().split('T')[0]) : '',
    endDate: exp.endDate ? (typeof exp.endDate === 'string' ? exp.endDate : new Date(exp.endDate).toISOString().split('T')[0]) : null,
    current: Boolean(exp.current),
  }));
  
  const [items, setItems] = useState<WorkExperience[]>(normalizedExperiences);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addExperience = () => {
    setItems([
      ...items,
      {
        id: `new-${Date.now()}`,
        company: "",
        position: "",
        startDate: "",
        endDate: null,
        current: false,
        description: "",
        orderIndex: items.length,
      },
    ]);
  };

  const removeExperience = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: any) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/profile/work-experiences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          experiences: items,
        }),
      });

      if (!response.ok) throw new Error("Failed to update work experiences");

      router.refresh();
    } catch (error) {
      console.error("Error updating work experiences:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Experience</CardTitle>
        <CardDescription>
          Add your professional work experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {items.map((exp, index) => (
            <div key={exp.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Experience {index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExperience(exp.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`company-${exp.id}`}>Company</Label>
                  <Input
                    id={`company-${exp.id}`}
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(exp.id, "company", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`position-${exp.id}`}>Position</Label>
                  <Input
                    id={`position-${exp.id}`}
                    value={exp.position}
                    onChange={(e) =>
                      updateExperience(exp.id, "position", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`startDate-${exp.id}`}>Start Date</Label>
                  <Input
                    id={`startDate-${exp.id}`}
                    type="date"
                    value={exp.startDate}
                    onChange={(e) =>
                      updateExperience(exp.id, "startDate", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`endDate-${exp.id}`}>End Date</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Input
                      id={`endDate-${exp.id}`}
                      type="date"
                      value={exp.endDate || ""}
                      onChange={(e) =>
                        updateExperience(exp.id, "endDate", e.target.value || null)
                      }
                      disabled={exp.current}
                      className="flex-1 w-full sm:w-auto"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`current-${exp.id}`}
                        checked={Boolean(exp.current)}
                        onChange={(e) => {
                          e.stopPropagation();
                          const isChecked = e.target.checked;
                          setItems((prevItems) =>
                            prevItems.map((item) => {
                              if (item.id === exp.id) {
                                return {
                                  ...item,
                                  current: isChecked,
                                  endDate: isChecked ? null : item.endDate,
                                };
                              }
                              return item;
                            })
                          );
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <Label htmlFor={`current-${exp.id}`} className="text-sm cursor-pointer">
                        Current
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${exp.id}`}>Description</Label>
                <Textarea
                  id={`description-${exp.id}`}
                  value={exp.description}
                  onChange={(e) =>
                    updateExperience(exp.id, "description", e.target.value)
                  }
                  rows={4}
                  required
                />
              </div>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="button" variant="outline" onClick={addExperience} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Saving..." : "Save Experiences"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

