import { requireAuth } from "@/lib/supabase/auth";
import JobDescriptionForm from "./components/JobDescriptionForm";

export default async function NewJobPage() {
  await requireAuth();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Add Job Description</h1>
        <p className="text-muted-foreground mt-2">
          Paste a job description to analyze
        </p>
      </div>
      <JobDescriptionForm />
    </div>
  );
}

