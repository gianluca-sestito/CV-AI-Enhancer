import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  try {
    const user = await requireAuth();

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        workExperiences: {
          orderBy: { orderIndex: "asc" },
        },
        skills: true,
        education: {
          orderBy: { orderIndex: "asc" },
        },
        languages: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Get or create profile
    let profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          firstName: body.firstName || null,
          lastName: body.lastName || null,
          email: body.email || user.email || null,
          phone: body.phone || null,
          location: body.location || null,
          address: body.address || null,
          city: body.city || null,
          country: body.country || null,
          postalCode: body.postalCode || null,
          profileImageUrl: body.profileImageUrl || null,
          personalSummary: body.personalSummary || null,
        },
      });
    } else {
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          firstName: body.firstName !== undefined ? body.firstName : undefined,
          lastName: body.lastName !== undefined ? body.lastName : undefined,
          email: body.email !== undefined ? body.email : undefined,
          phone: body.phone !== undefined ? body.phone : undefined,
          location: body.location !== undefined ? body.location : undefined,
          address: body.address !== undefined ? body.address : undefined,
          city: body.city !== undefined ? body.city : undefined,
          country: body.country !== undefined ? body.country : undefined,
          postalCode: body.postalCode !== undefined ? body.postalCode : undefined,
          profileImageUrl: body.profileImageUrl !== undefined ? body.profileImageUrl : undefined,
          personalSummary: body.personalSummary !== undefined ? body.personalSummary : undefined,
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

