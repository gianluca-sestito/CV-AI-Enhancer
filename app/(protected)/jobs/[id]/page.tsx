import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobDescriptionView from "./components/JobDescriptionView";
import AnalysisResults from "./components/AnalysisResults";
import CVGenerator from "./components/CVGenerator";
import JobSidebarClient from "./components/JobSidebarClient";
import { parseAnalysisResult } from "@/lib/utils/type-guards";
import type { AnalysisResultData } from "@/lib/types/analysis";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;

  const job = await prisma.jobDescription.findUnique({
    where: { id },
    include: {
      analysisResults: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      generatedCVs: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!job || job.userId !== user.id) {
    notFound();
  }

  // Get user profile for analysis
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      workExperiences: {
        orderBy: { orderIndex: "asc" },
      },
      skills: true,
      education: {
        orderBy: { orderIndex: "asc" },
      },
      languages: true,
    },
  });

  const latestAnalysis = job.analysisResults[0] || null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Enhanced Header */}
      <div className="mb-8 pb-6 border-b border-border/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link href="/jobs">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl lg:text-4xl font-bold">{job.title}</h1>
            </div>
            {job.company && (
              <div className="flex items-center gap-2 text-muted-foreground ml-11">
                <Building2 className="h-4 w-4" />
                <p className="text-base lg:text-lg">{job.company}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <JobDescriptionView job={job} />
          
          {profile && (
            <>
              {latestAnalysis ? (
                <>
                  <AnalysisResults
                    analysis={{
                      ...parseAnalysisResult({
                        strengths: latestAnalysis.strengths,
                        gaps: latestAnalysis.gaps,
                        missingSkills: latestAnalysis.missingSkills,
                        suggestedFocusAreas: latestAnalysis.suggestedFocusAreas,
                        jobRequirements: latestAnalysis.jobRequirements,
                      }),
                      // Preserve critical fields from latestAnalysis that parseAnalysisResult doesn't handle correctly
                      id: latestAnalysis.id,
                      matchScore: latestAnalysis.matchScore,
                      status: latestAnalysis.status,
                    } as AnalysisResultData & { id: string; matchScore: number; status: string }}
                    jobId={job.id}
                    profileId={profile.id}
                  />
                  <CVGenerator
                    job={job}
                    analysis={latestAnalysis}
                    profile={profile}
                    existingCVs={job.generatedCVs}
                  />
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg mb-2">No analysis yet</p>
                  <p className="text-sm">Use the sidebar to start analyzing this job description</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1">
          {profile && (
            <JobSidebarClient
              job={{
                id: job.id,
                title: job.title,
                company: job.company,
                createdAt: job.createdAt,
              }}
              analysis={latestAnalysis ? {
                matchScore: latestAnalysis.matchScore,
                status: latestAnalysis.status,
                completedAt: latestAnalysis.completedAt,
                createdAt: latestAnalysis.createdAt,
              } : null}
              hasAnalysis={job.analysisResults.length > 0}
              hasCVs={job.generatedCVs.length > 0}
              jobDescription={job.description}
              analysisResultId={latestAnalysis?.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}
