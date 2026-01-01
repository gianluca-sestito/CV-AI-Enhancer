import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { handleApiError } from "@/lib/utils/errors";

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { profileId, experiences } = body;

    // Verify profile belongs to user
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile || profile.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete existing experiences
    await prisma.workExperience.deleteMany({
      where: { profileId },
    });

    // Create new experiences
    const created = await prisma.workExperience.createMany({
      data: (experiences as Array<{
        company: string;
        position: string;
        startDate: string;
        endDate?: string | null;
        current?: boolean;
        description: string;
      }>).map((exp, index) => ({
        profileId,
        company: exp.company,
        position: exp.position,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : null,
        current: exp.current || false,
        description: exp.description,
        orderIndex: index,
      })),
    });

    return NextResponse.json({ success: true, count: created.count });
  } catch (error) {
    return handleApiError(error);
  }
}

