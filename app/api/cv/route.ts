import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { triggerClient } from "@/lib/trigger/client";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const {
      jobDescriptionId,
      analysisResultId,
      jobDescription,
    } = body;

    // Create CV record
    const cv = await prisma.generatedCV.create({
      data: {
        userId: user.id,
        jobDescriptionId,
        analysisResultId: analysisResultId || null,
        status: "processing",
        markdownContent: "",
      },
    });

    // Trigger Trigger.dev task (profile data will be fetched in the task)
    await triggerClient.triggerCVGeneration({
      userId: user.id,
      jobDescriptionId,
      analysisResultId,
      jobDescription,
      cvId: cv.id,
    });

    return NextResponse.json(cv);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

