import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const updateCVSchema = z.object({
  markdownContent: z.string(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const cv = await prisma.generatedCV.findUnique({
      where: { id },
      include: {
        jobDescription: true,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    if (cv.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(cv);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateCVSchema.parse(body);

    // Check if CV exists and user owns it
    const existingCV = await prisma.generatedCV.findUnique({
      where: { id },
    });

    if (!existingCV) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    if (existingCV.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update CV markdown content
    const updatedCV = await prisma.generatedCV.update({
      where: { id },
      data: {
        markdownContent: validatedData.markdownContent,
      },
      include: {
        jobDescription: true,
      },
    });

    return NextResponse.json(updatedCV);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

