import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, Sparkles, Briefcase, Target } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Hero Header */}
        <header className="mb-12 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4">
                Job Opportunities
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Track your target positions and see how well you match each opportunity
              </p>
            </div>
            <Link href="/jobs/new" className="w-full lg:w-auto">
              <Button variant="premium" size="lg" className="w-full lg:w-auto" aria-label="Add new job description">
                <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
                Add Job Description
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          {jobs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up stagger-1">
              <Card variant="elevated" className="bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Total Opportunities</p>
                      <p className="text-3xl font-display font-bold">{jobs.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated" className="bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Analyzed</p>
                      <p className="text-3xl font-display font-bold">{analyzedJobsCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </header>

        {/* Content */}
        {jobs.length === 0 ? (
          <Card variant="elevated" className="animate-fade-in-up stagger-2">
            <CardContent className="py-20 text-center">
              <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl" />
                  <div className="relative rounded-full bg-gradient-mesh p-6">
                    <FileText className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-display font-semibold">Start Your Journey</h3>
                  <p className="text-muted-foreground text-lg">
                    Add your first job description and discover how well your profile matches.
                    Our AI will analyze the requirements and help you create the perfect CV.
                  </p>
                </div>
                <Link href="/jobs/new">
                  <Button variant="premium" size="lg" className="mt-4">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Add Your First Job
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 animate-fade-in-up stagger-2">
            {jobs.map((job: typeof jobs[0], index: number) => (
              <div key={job.id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 5)}`}>
                <JobCard job={job} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
