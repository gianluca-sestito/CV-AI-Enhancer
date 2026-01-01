import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const updateSkillSchema = z.object({
  skillId: z.string(),
  profileId: z.string(),
  name: z.string().min(1),
  category: z.enum(['Technical', 'Soft Skills', 'Programming Language']),
  proficiencyLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).nullable(),
});

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate request body
    const validatedData = updateSkillSchema.parse(body);

    // Verify profile belongs to user
    const profile = await prisma.profile.findUnique({
      where: { id: validatedData.profileId },
    });

    if (!profile || profile.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify skill belongs to profile
    const existingSkill = await prisma.skill.findUnique({
      where: { id: validatedData.skillId },
    });

    if (!existingSkill || existingSkill.profileId !== validatedData.profileId) {
      return NextResponse.json(
        { error: "Skill not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if another skill with the same name already exists (excluding current skill)
    const duplicateSkill = await prisma.skill.findFirst({
      where: {
        profileId: validatedData.profileId,
        name: validatedData.name,
        id: { not: validatedData.skillId },
      },
    });

    if (duplicateSkill) {
      return NextResponse.json(
        { error: "A skill with this name already exists in your profile" },
        { status: 400 }
      );
    }

    // Update skill
    const updatedSkill = await prisma.skill.update({
      where: { id: validatedData.skillId },
      data: {
        name: validatedData.name,
        category: validatedData.category,
        proficiencyLevel: validatedData.proficiencyLevel,
      },
    });

    return NextResponse.json({ success: true, skill: updatedSkill });
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

