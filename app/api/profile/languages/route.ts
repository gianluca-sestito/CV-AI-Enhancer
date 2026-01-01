import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { handleApiError } from "@/lib/utils/errors";

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { profileId, languages } = body;

    // Verify profile belongs to user
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile || profile.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete existing languages
    await prisma.language.deleteMany({
      where: { profileId },
    });

    // Create new languages
    const created = await prisma.language.createMany({
      data: (languages as Array<{ name: string; proficiencyLevel: string }>).map((lang) => ({
        profileId,
        name: lang.name,
        proficiencyLevel: lang.proficiencyLevel,
      })),
    });

    return NextResponse.json({ success: true, count: created.count });
  } catch (error) {
    return handleApiError(error);
  }
}

