import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  try {
    const user = await requireAuth();

    const jobs = await prisma.jobDescription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        analysisResults: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json(jobs);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const job = await prisma.jobDescription.create({
      data: {
        userId: user.id,
        title: body.title,
        company: body.company || null,
        description: body.description,
      },
    });

    return NextResponse.json(job);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

