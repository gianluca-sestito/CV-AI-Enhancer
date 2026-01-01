"use client";

import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code } from "lucide-react";
import type { AnalysisResultData } from "@/lib/types/analysis";

interface AnalysisStrengthsProps {
  strengths: AnalysisResultData["strengths"];
}

export default memo(function AnalysisStrengths({ strengths }: AnalysisStrengthsProps) {
  if (!strengths || strengths.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Strengths
        </CardTitle>
        <CardDescription>
          Areas where your profile aligns well with the job requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {strengths.map((strength, idx) => (
            <div key={idx} className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold mb-1">{strength.title}</h4>
              <p className="text-sm text-muted-foreground">{strength.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

