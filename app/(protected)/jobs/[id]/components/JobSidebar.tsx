import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  BarChart3, 
  FileText, 
  User, 
  Building2, 
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JobSidebarProps {
  job: {
    id: string;
    title: string;
    company: string | null;
    createdAt: Date;
  };
  analysis: {
    matchScore?: number;
    status?: string;
    completedAt?: Date | null;
    createdAt?: Date;
  } | null;
  hasAnalysis: boolean;
  hasCVs: boolean;
  onAnalyze?: () => void;
  onRedoAnalysis?: () => void;
  onGenerateCV?: () => void;
  analyzing?: boolean;
  generatingCV?: boolean;
}

export default function JobSidebar({
  job,
  analysis,
  hasAnalysis,
  hasCVs,
  onAnalyze,
  onRedoAnalysis,
  onGenerateCV,
  analyzing = false,
  generatingCV = false,
}: JobSidebarProps) {
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
      {/* Quick Actions */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!hasAnalysis && onAnalyze && (
            <Button
              onClick={onAnalyze}
              disabled={analyzing}
              className="w-full"
              size="lg"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {analyzing ? "Analyzing..." : "Analyze Job"}
            </Button>
          )}
          {hasAnalysis && onRedoAnalysis && (
            <Button
              onClick={onRedoAnalysis}
              disabled={analyzing}
              className="w-full"
              size="lg"
              variant="outline"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {analyzing ? "Analyzing..." : "Redo Analysis"}
            </Button>
          )}
          {hasAnalysis && onGenerateCV && (
            <Button
              onClick={onGenerateCV}
              disabled={generatingCV}
              className="w-full"
              size="lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              {generatingCV ? "Generating..." : "Generate CV"}
            </Button>
          )}
          <Link href="/profile" className="block">
            <Button variant="outline" className="w-full" size="lg">
              <User className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Status Card */}
      {analysis && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analysis Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.matchScore !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Match Score</span>
                  <Badge
                    variant={analysis.matchScore >= 70 ? "default" : "secondary"}
                    className="text-base px-3 py-1"
                  >
                    {analysis.matchScore}%
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      analysis.matchScore >= 70
                        ? "bg-green-600"
                        : analysis.matchScore >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    )}
                    style={{ width: `${analysis.matchScore}%` }}
                  />
                </div>
              </div>
            )}
            {analysis.status && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(analysis.status)}
                  <Badge
                    variant={
                      analysis.status === "completed"
                        ? "default"
                        : analysis.status === "processing"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {analysis.status}
                  </Badge>
                </div>
              </div>
            )}
            {analysis.completedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Last Analyzed
                </span>
                <span>{formatDate(analysis.completedAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Job Info */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Job Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {job.company && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Company</span>
              <span className="font-medium">{job.company}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created
            </span>
            <span>{formatDate(job.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

