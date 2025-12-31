import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { profileId, skills } = body;

    // Verify profile belongs to user
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile || profile.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete existing skills
    await prisma.skill.deleteMany({
      where: { profileId },
    });

    // Create new skills
    const created = await prisma.skill.createMany({
      data: skills.map((skill: any) => ({
        profileId,
        name: skill.name,
        category: skill.category || null,
        proficiencyLevel: skill.proficiencyLevel || null,
      })),
    });

    return NextResponse.json({ success: true, count: created.count });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

