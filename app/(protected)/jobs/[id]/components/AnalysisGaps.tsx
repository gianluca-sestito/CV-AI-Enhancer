"use client";

import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";
import type { AnalysisResultData } from "@/lib/types/analysis";

interface AnalysisGapsProps {
  gaps: AnalysisResultData["gaps"];
}

const severityColors = {
  high: "destructive",
  medium: "default",
  low: "secondary",
} as const;

export default memo(function AnalysisGaps({ gaps }: AnalysisGapsProps) {
  if (!gaps || gaps.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Areas for Improvement
        </CardTitle>
        <CardDescription>
          Gaps between your profile and the job requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {gaps.map((gap, idx) => (
            <div key={idx} className="border-l-4 border-orange-500 pl-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold">{gap.title}</h4>
                <Badge
                  variant={
                    severityColors[gap.severity.toLowerCase() as keyof typeof severityColors] ||
                    "default"
                  }
                >
                  {gap.severity}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{gap.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

