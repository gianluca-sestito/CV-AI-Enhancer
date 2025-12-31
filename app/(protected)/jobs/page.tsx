import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
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
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
