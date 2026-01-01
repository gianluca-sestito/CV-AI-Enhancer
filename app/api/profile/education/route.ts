import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { handleApiError } from "@/lib/utils/errors";

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { profileId, education } = body;

    // Verify profile belongs to user
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile || profile.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete existing education
    await prisma.education.deleteMany({
      where: { profileId },
    });

    // Create new education
    const created = await prisma.education.createMany({
      data: (education as Array<{
        institution: string;
        degree: string;
        fieldOfStudy?: string | null;
        startDate: string;
        endDate?: string | null;
        current?: boolean;
        description?: string | null;
      }>).map((edu, index) => ({
        profileId,
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy || null,
        startDate: new Date(edu.startDate),
        endDate: edu.endDate ? new Date(edu.endDate) : null,
        current: edu.current || false,
        description: edu.description || null,
        orderIndex: index,
      })),
    });

    return NextResponse.json({ success: true, count: created.count });
  } catch (error) {
    return handleApiError(error);
  }
}

