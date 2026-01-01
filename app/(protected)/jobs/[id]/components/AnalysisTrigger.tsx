"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Sparkles } from "lucide-react";
import type { ProfileWithRelations } from "@/lib/types";
import { logger } from "@/lib/utils/logger";

interface JobDescription {
  id: string;
  title: string;
  description: string;
}

type Profile = ProfileWithRelations;

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
      logger.error("Error starting analysis", error);
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
