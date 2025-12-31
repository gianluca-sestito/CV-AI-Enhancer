import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const supabase = await createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      // If bucket doesn't exist, create it or use public URL
      // For now, we'll use a simple approach with public URL
      // In production, you should set up Supabase Storage bucket
      console.error("Upload error:", uploadError);
      
      // Fallback: store as base64 or use a different storage solution
      // For now, return error - user should set up Supabase Storage
      return NextResponse.json(
        { error: "Image upload failed. Please configure Supabase Storage." },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("profile-images").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    // Update profile with image URL
    let profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          profileImageUrl: publicUrl,
        },
      });
    } else {
      // Delete old image if exists
      if (profile.profileImageUrl) {
        const oldPath = profile.profileImageUrl.split("/").slice(-2).join("/");
        await supabase.storage.from("profile-images").remove([oldPath]);
      }

      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          profileImageUrl: publicUrl,
        },
      });
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

