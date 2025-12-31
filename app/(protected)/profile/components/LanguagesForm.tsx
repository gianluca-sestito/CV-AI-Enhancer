"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface Language {
  id: string;
  name: string;
  proficiencyLevel: string;
}

export default function LanguagesForm({
  profileId,
  languages,
}: {
  profileId: string;
  languages: Language[];
}) {
  const [items, setItems] = useState<Language[]>(languages);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addLanguage = () => {
    setItems([
      ...items,
      {
        id: `new-${Date.now()}`,
        name: "",
        proficiencyLevel: "",
      },
    ]);
  };

  const removeLanguage = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateLanguage = (id: string, field: keyof Language, value: any) => {
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
    } catch (error) {
      console.error("Error updating languages:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Languages</CardTitle>
        <CardDescription>
          Add languages you speak and your proficiency level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {items.map((lang) => (
            <div key={lang.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`lang-name-${lang.id}`}>Language</Label>
                <Input
                  id={`lang-name-${lang.id}`}
                  value={lang.name}
                  onChange={(e) =>
                    updateLanguage(lang.id, "name", e.target.value)
                  }
                  placeholder="e.g., English, Spanish"
                  required
                />
              </div>

              <div className="w-full sm:w-48 space-y-2">
                <Label htmlFor={`proficiency-${lang.id}`}>Proficiency</Label>
                <Select
                  value={lang.proficiencyLevel}
                  onValueChange={(value) =>
                    updateLanguage(lang.id, "proficiencyLevel", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Native">Native</SelectItem>
                    <SelectItem value="Fluent">Fluent</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Basic">Basic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLanguage(lang.id)}
                className="self-start sm:self-end"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="button" variant="outline" onClick={addLanguage} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Language
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Saving..." : "Save Languages"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

