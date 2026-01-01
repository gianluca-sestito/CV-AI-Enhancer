import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { triggerClient } from "@/lib/trigger/client";
import { handleApiError } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const {
      jobDescriptionId,
      analysisResultId,
      jobDescription,
    } = body;

    // Validate required fields
    if (!analysisResultId) {
      return NextResponse.json(
        { error: "analysisResultId is required" },
        { status: 400 }
      );
    }

    // Create CV record
    const cv = await prisma.generatedCV.create({
      data: {
        userId: user.id,
        jobDescriptionId,
        analysisResultId: analysisResultId,
        status: "processing",
        markdownContent: null, // Deprecated, will be replaced by structuredContent
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
  } catch (error) {
    return handleApiError(error);
  }
}

