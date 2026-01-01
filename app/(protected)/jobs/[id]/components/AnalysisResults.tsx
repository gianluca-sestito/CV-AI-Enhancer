"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart3 } from "lucide-react";
import type { AnalysisResultData, MissingSkill } from "@/lib/types/analysis";
import AnalysisStrengths from "./AnalysisStrengths";
import AnalysisGaps from "./AnalysisGaps";
import AnalysisMissingSkills from "./AnalysisMissingSkills";
import { logger } from "@/lib/utils/logger";

interface AnalysisResult extends AnalysisResultData {
  id: string;
}

export default function AnalysisResults({
  analysis: initialAnalysis,
  jobId,
  profileId,
}: {
  analysis: AnalysisResult;
  jobId: string;
  profileId: string;
}) {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [loading, setLoading] = useState(analysis.status === "processing");
  const router = useRouter();

  useEffect(() => {
    if (analysis.status === "processing") {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/analysis/${analysis.id}`);
          if (response.ok) {
            const data = await response.json();
            setAnalysis(data);
            if (data.status === "completed" || data.status === "failed") {
              setLoading(false);
              clearInterval(interval);
            }
          }
        } catch (error) {
          logger.error("Error fetching analysis", error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [analysis.id, analysis.status]);


  if (loading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Analyzing your profile...</p>
        </CardContent>
      </Card>
    );
  }

  if (analysis.status === "failed") {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Analysis Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            The analysis could not be completed. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analysis Results
              </CardTitle>
              <CardDescription className="mt-1">
                Your profile match with this job description
              </CardDescription>
            </div>
            <Badge 
              variant={analysis.matchScore >= 70 ? "default" : "secondary"} 
              className="self-start sm:self-auto text-base px-4 py-1.5"
            >
              {analysis.matchScore}% Match
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <AnalysisStrengths strengths={analysis.strengths} />

          <AnalysisGaps gaps={analysis.gaps} />

          <AnalysisMissingSkills missingSkills={analysis.missingSkills} profileId={profileId} />

          {analysis.suggestedFocusAreas.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                Suggested Focus Areas
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm lg:text-base pl-4">
                {analysis.suggestedFocusAreas.map((area, index) => (
                  <li key={index} className="text-muted-foreground leading-relaxed">{area}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
