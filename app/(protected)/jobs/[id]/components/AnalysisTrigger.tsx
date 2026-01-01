"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Sparkles } from "lucide-react";

interface JobDescription {
  id: string;
  title: string;
  description: string;
}

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
  workExperiences: any[];
  skills: any[];
  education: any[];
  languages: any[];
}

export default function AnalysisTrigger({
  job,
  profile,
}: {
  job: JobDescription;
  profile: Profile;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAnalyze = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescriptionId: job.id,
          jobDescription: job.description,
        }),
      });

      if (!response.ok) throw new Error("Failed to start analysis");

      router.refresh();
    } catch (error) {
      console.error("Error starting analysis:", error);
      alert("Failed to start analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analysis
        </CardTitle>
        <CardDescription>
          Analyze your profile against this job description to see how well you match
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleAnalyze} 
          disabled={loading} 
          className="w-full sm:w-auto"
          size="lg"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {loading ? "Starting Analysis..." : "Analyze Job Description"}
        </Button>
      </CardContent>
    </Card>
  );
}
