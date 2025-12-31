"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface JobDescription {
  id: string;
  title: string;
  company: string | null;
  description: string;
}

export default function JobDescriptionView({
  job,
}: {
  job: JobDescription;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Description</CardTitle>
        <CardDescription>
          {job.company && `at ${job.company}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap text-sm">{job.description}</div>
      </CardContent>
    </Card>
  );
}

