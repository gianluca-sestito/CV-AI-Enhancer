"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface JobDescription {
  id: string;
  title: string;
  description: string;
}

interface AnalysisResult {
  id: string;
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

export default function CVGenerator({
  job,
  analysis,
  profile,
}: {
  job: JobDescription;
  analysis: AnalysisResult;
  profile: Profile;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescriptionId: job.id,
          analysisResultId: analysis.id,
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

      if (!response.ok) throw new Error("Failed to generate CV");

      const data = await response.json();
      router.push(`/cv/${data.id}`);
    } catch (error) {
      console.error("Error generating CV:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CV Generation</CardTitle>
        <CardDescription>
          Generate a tailored CV based on this job description
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGenerate} disabled={loading} className="w-full sm:w-auto">
          {loading ? "Generating CV..." : "Generate Tailored CV"}
        </Button>
      </CardContent>
    </Card>
  );
}

