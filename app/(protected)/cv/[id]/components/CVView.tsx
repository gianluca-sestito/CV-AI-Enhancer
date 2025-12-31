"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface GeneratedCV {
  id: string;
  markdownContent: string;
  status: string;
  jobDescription: {
    title: string;
    company: string | null;
  };
}

export default function CVView({ cv: initialCV }: { cv: GeneratedCV }) {
  const [cv, setCV] = useState(initialCV);
  const [loading, setLoading] = useState(cv.status === "processing");
  const router = useRouter();

  useEffect(() => {
    if (cv.status === "processing") {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/cv/${cv.id}`);
          if (response.ok) {
            const data = await response.json();
            setCV(data);
            if (data.status === "completed" || data.status === "failed") {
              setLoading(false);
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error("Error fetching CV:", error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [cv.id, cv.status]);

  const handleDownloadPDF = () => {
    window.open(`/api/cv/${cv.id}/pdf`, "_blank");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Generating your CV...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cv.status === "failed") {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Card>
          <CardHeader>
            <CardTitle>CV Generation Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              The CV could not be generated. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Generated CV</h1>
          <p className="text-muted-foreground mt-2">
            Tailored for {cv.jobDescription.title}
            {cv.jobDescription.company && ` at ${cv.jobDescription.company}`}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={handleDownloadPDF} variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown>{cv.markdownContent}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

