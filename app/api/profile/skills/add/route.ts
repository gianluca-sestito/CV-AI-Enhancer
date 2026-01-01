import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const addSkillSchema = z.object({
  profileId: z.string(),
  name: z.string().min(1),
  category: z.enum(['Technical', 'Soft Skills', 'Programming Language']),
  proficiencyLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate request body
    const validatedData = addSkillSchema.parse(body);

    // Verify profile belongs to user
    const profile = await prisma.profile.findUnique({
      where: { id: validatedData.profileId },
    });

    if (!profile || profile.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if skill already exists
    const existingSkill = await prisma.skill.findFirst({
      where: {
        profileId: validatedData.profileId,
        name: validatedData.name,
      },
    });

    if (existingSkill) {
      return NextResponse.json(
        { error: "Skill already exists in your profile" },
        { status: 400 }
      );
    }

    // Create new skill
    const skill = await prisma.skill.create({
      data: {
        profileId: validatedData.profileId,
        name: validatedData.name,
        category: validatedData.category,
        proficiencyLevel: validatedData.proficiencyLevel || null,
      },
    });

    return NextResponse.json({ success: true, skill });
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

