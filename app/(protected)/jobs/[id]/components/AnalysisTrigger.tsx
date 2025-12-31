"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface JobDescription {
  id: string;
  title: string;
  description: string;
}

interface Profile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  profileImageUrl: string | null;
  personalSummary: string | null;
  workExperiences: any[];
  skills: any[];
  education: any[];
  languages: any[];
}

export default function AnalysisTrigger({
  job,
  profile,
}: {
  job: JobDescription;
  profile: Profile;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAnalyze = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescriptionId: job.id,
          jobDescription: job.description,
          profileData: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            phone: profile.phone,
            location: profile.location,
            address: profile.address,
            city: profile.city,
            country: profile.country,
            postalCode: profile.postalCode,
            profileImageUrl: profile.profileImageUrl,
            personalSummary: profile.personalSummary,
            workExperiences: profile.workExperiences,
            skills: profile.skills,
            education: profile.education,
            languages: profile.languages,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to start analysis");

      router.refresh();
    } catch (error) {
      console.error("Error starting analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis</CardTitle>
        <CardDescription>
          Analyze your profile against this job description
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAnalyze} disabled={loading} className="w-full sm:w-auto">
          {loading ? "Starting Analysis..." : "Analyze Job Description"}
        </Button>
      </CardContent>
    </Card>
  );
}

