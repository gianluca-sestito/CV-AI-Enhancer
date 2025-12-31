"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Profile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  profileImageUrl: string | null;
  personalSummary: string | null;
}

export default function PersonalSummaryForm({ profile }: { profile: Profile }) {
  const [summary, setSummary] = useState(profile.personalSummary || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalSummary: summary,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Summary</CardTitle>
        <CardDescription>
          Write a brief summary about yourself and your professional background
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              placeholder="Enter your professional summary..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={6}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Saving..." : "Save Summary"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

