import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";
import CVView from "./components/CVView";
import type { CVData } from "./components/types";

export default async function CVPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;

  const cv = await prisma.generatedCV.findUnique({
    where: { id },
    include: {
      jobDescription: true,
    },
  });

  if (!cv || cv.userId !== user.id) {
    notFound();
  }

  // Parse structuredContent from JsonValue to CVData | null
  const structuredContent: CVData | null = 
    cv.structuredContent && typeof cv.structuredContent === "object" && !Array.isArray(cv.structuredContent)
      ? (cv.structuredContent as unknown as CVData)
      : null;

  return (
    <CVView
      cv={{
        ...cv,
        structuredContent,
      }}
    />
  );
}

