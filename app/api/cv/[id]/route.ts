import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";
import { updateCVSchema } from "@/lib/types/schemas";
import type { CVData } from "@/lib/types/cv";
import type { Prisma } from "@prisma/client";

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

    // Update CV content (prefer structuredContent, fallback to markdownContent for backward compatibility)
    const updateData: {
      structuredContent?: Prisma.InputJsonValue;
      markdownContent?: string;
    } = {};
    if (validatedData.structuredContent !== undefined) {
      updateData.structuredContent = validatedData.structuredContent as Prisma.InputJsonValue;
    }
    if (validatedData.markdownContent !== undefined) {
      updateData.markdownContent = validatedData.markdownContent;
    }

    const updatedCV = await prisma.generatedCV.update({
      where: { id },
      data: updateData,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

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

    // Delete CV
    await prisma.generatedCV.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "CV deleted successfully" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

