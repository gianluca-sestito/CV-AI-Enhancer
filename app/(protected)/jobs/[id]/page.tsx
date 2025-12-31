import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";
import JobDescriptionView from "./components/JobDescriptionView";
import AnalysisTrigger from "./components/AnalysisTrigger";
import AnalysisResults from "./components/AnalysisResults";
import CVGenerator from "./components/CVGenerator";

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
        take: 1,
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">{job.title}</h1>
        {job.company && (
          <p className="text-muted-foreground mt-2">{job.company}</p>
        )}
      </div>

      <div className="grid gap-6">
        <JobDescriptionView job={job} />
        
        {profile && (
          <>
            <AnalysisTrigger job={job} profile={profile} />
            {job.analysisResults.length > 0 && (
              <AnalysisResults
                analysis={{
                  ...job.analysisResults[0],
                  strengths: (job.analysisResults[0].strengths as any) || [],
                  gaps: (job.analysisResults[0].gaps as any) || [],
                  missingSkills: (job.analysisResults[0].missingSkills as any) || [],
                  suggestedFocusAreas: (job.analysisResults[0].suggestedFocusAreas as any) || [],
                } as any}
                jobId={job.id}
              />
            )}
            {job.analysisResults.length > 0 && (
              <CVGenerator
                job={job}
                analysis={job.analysisResults[0] as any}
                profile={profile}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

