import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

// Schema for styles validation (matches CVStyles type)
const elementStylesSchema = z.object({
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  color: z.string().optional(),
  lineHeight: z.string().optional(),
  marginTop: z.string().optional(),
  marginBottom: z.string().optional(),
  padding: z.string().optional(),
});

const sectionStylesSchema = z.object({
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  color: z.string().optional(),
  backgroundColor: z.string().optional(),
  borderColor: z.string().optional(),
  marginTop: z.string().optional(),
  marginBottom: z.string().optional(),
  padding: z.string().optional(),
  spacing: z.string().optional(),
});

const stylesSchema = z.object({
  global: z.object({
    fontFamily: z.string(),
    baseFontSize: z.string(),
    lineHeight: z.string(),
    textColor: z.string(),
    backgroundColor: z.string(),
    primaryColor: z.string(),
    secondaryColor: z.string(),
    borderColor: z.string(),
    baseSpacing: z.string(),
    sectionSpacing: z.string(),
  }),
  sections: z.object({
    header: sectionStylesSchema.optional(),
    summary: sectionStylesSchema.optional(),
    experience: sectionStylesSchema.optional(),
    skills: sectionStylesSchema.optional(),
    education: sectionStylesSchema.optional(),
    languages: sectionStylesSchema.optional(),
  }),
  elements: z.object({
    h1: elementStylesSchema.optional(),
    h2: elementStylesSchema.optional(),
    h3: elementStylesSchema.optional(),
    p: elementStylesSchema.optional(),
    badge: elementStylesSchema.optional(),
    listItem: elementStylesSchema.optional(),
  }),
});

const updateStylesSchema = z.object({
  styles: stylesSchema,
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Validate request body
    const body = await request.json();
    const validatedData = updateStylesSchema.parse(body);

    // Check if CV exists and belongs to user
    const cv = await prisma.generatedCV.findUnique({
      where: { id },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    if (cv.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update CV styles
    const updatedCV = await prisma.generatedCV.update({
      where: { id },
      data: {
        styles: validatedData.styles,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Styles saved successfully",
    });
  } catch (error: unknown) {
    console.error("Error saving styles:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid styles data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json(
      {
        error: "Failed to save styles",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Check if CV exists and belongs to user
    const cv = await prisma.generatedCV.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        styles: true,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    if (cv.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({
      styles: cv.styles || null,
    });
  } catch (error: unknown) {
    console.error("Error fetching styles:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json(
      {
        error: "Failed to fetch styles",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

