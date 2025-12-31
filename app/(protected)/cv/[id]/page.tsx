import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";
import CVView from "./components/CVView";

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

  return <CVView cv={cv} />;
}

