import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { triggerClient } from "@/lib/trigger/client";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { jobDescriptionId, jobDescription } = body;

    // Create analysis record
    const analysis = await prisma.analysisResult.create({
      data: {
        userId: user.id,
        jobDescriptionId,
        status: "processing",
        matchScore: 0,
        strengths: [],
        gaps: [],
        missingSkills: [],
        suggestedFocusAreas: [],
      },
    });

    // Trigger Trigger.dev task (profile data will be fetched in the task)
    await triggerClient.triggerAnalysis({
      userId: user.id,
      jobDescriptionId,
      jobDescription,
      analysisResultId: analysis.id,
    });

    return NextResponse.json(analysis);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

