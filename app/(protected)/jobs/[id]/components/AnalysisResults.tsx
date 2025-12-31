"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface AnalysisResult {
  id: string;
  matchScore: number;
  strengths: Array<{ title: string; description: string }>;
  gaps: Array<{ title: string; description: string; severity: string }>;
  missingSkills: string[];
  suggestedFocusAreas: string[];
  status: string;
}

export default function AnalysisResults({
  analysis: initialAnalysis,
  jobId,
}: {
  analysis: AnalysisResult;
  jobId: string;
}) {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [loading, setLoading] = useState(analysis.status === "processing");

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
          console.error("Error fetching analysis:", error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [analysis.id, analysis.status]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing your profile...</p>
        </CardContent>
      </Card>
    );
  }

  if (analysis.status === "failed") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis Failed</CardTitle>
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
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Your profile match with this job description
            </CardDescription>
          </div>
          <Badge variant={analysis.matchScore >= 70 ? "default" : "secondary"} className="self-start sm:self-auto">
            {analysis.matchScore}% Match
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Strengths</h3>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="text-sm">
                <strong>{strength.title}:</strong> {strength.description}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Gaps</h3>
          <ul className="space-y-2">
            {analysis.gaps.map((gap, index) => (
              <li key={index} className="text-sm flex flex-col sm:flex-row sm:items-center gap-2">
                <span>
                  <strong>{gap.title}:</strong> {gap.description}
                </span>
                <Badge
                  variant={
                    gap.severity === "high"
                      ? "destructive"
                      : gap.severity === "medium"
                      ? "default"
                      : "secondary"
                  }
                  className="self-start sm:self-auto"
                >
                  {gap.severity}
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        {analysis.missingSkills.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Missing Skills</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.suggestedFocusAreas.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Suggested Focus Areas</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {analysis.suggestedFocusAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

