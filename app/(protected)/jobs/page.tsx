import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Job Descriptions</h1>
          <p className="text-muted-foreground mt-2">
            Manage job descriptions and view analysis results
          </p>
        </div>
        <Link href="/jobs/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Job Description
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No job descriptions yet. Add your first one to get started.
            </p>
            <Link href="/jobs/new">
              <Button>Add Job Description</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job: typeof jobs[0]) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle>{job.title}</CardTitle>
                    {job.company && (
                      <CardDescription>{job.company}</CardDescription>
                    )}
                  </div>
                  <Link href={`/jobs/${job.id}`} className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto">View</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {job.description}
                </p>
                {job.analysisResults.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm font-medium">
                      Latest Analysis: {job.analysisResults[0].matchScore}% match
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

