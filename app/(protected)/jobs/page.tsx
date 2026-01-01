import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, Sparkles } from "lucide-react";
import JobCard from "./components/JobCard";

export default async function JobsPage() {
  const user = await requireAuth();

  const jobs = await prisma.jobDescription.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      analysisResults: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const analyzedJobsCount = jobs.filter(
    (job) => job.analysisResults.length > 0 && job.analysisResults[0].status === "completed"
  ).length;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Enhanced Header */}
      <header className="mb-8 pb-6 border-b border-border/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Job Descriptions</h1>
            <p className="text-muted-foreground text-base">
              Manage job descriptions and view analysis results
            </p>
            {jobs.length > 0 && (
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground" role="status" aria-live="polite">
                <span>{jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}</span>
                {analyzedJobsCount > 0 && (
                  <span>• {analyzedJobsCount} analyzed</span>
                )}
              </div>
            )}
          </div>
          <Link href="/jobs/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto" size="lg" aria-label="Add new job description">
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Add Job Description
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      {jobs.length === 0 ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No job descriptions yet</h3>
                <p className="text-muted-foreground max-w-md">
                  Get started by adding your first job description. We'll help you analyze it and generate tailored CVs.
                </p>
              </div>
              <Link href="/jobs/new">
                <Button size="lg" className="mt-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Add Your First Job Description
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job: typeof jobs[0]) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
