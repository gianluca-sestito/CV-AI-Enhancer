import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/admin";

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
    // Use admin client (service role) for server-side uploads
    // This bypasses RLS and allows server to upload on behalf of users
    const supabase = createAdminClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    // Don't include bucket name in path - it's specified in .from()
    const filePath = fileName;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Uploading file:", { fileName, filePath, size: file.size, type: file.type, userId: user.id });

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Allow overwriting
      });

    if (uploadError) {
      console.error("Upload error details:", {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        error: uploadError,
        filePath,
        userId: user.id,
      });
      
      // Check if bucket doesn't exist
      if (uploadError.message?.includes("Bucket not found") || uploadError.message?.includes("The resource was not found")) {
        return NextResponse.json(
          { 
            error: "Storage bucket 'profile-images' not found. Please create it in Supabase Dashboard: Storage > New Bucket > Name: 'profile-images' > Public bucket",
            details: uploadError.message 
          },
          { status: 400 }
        );
      }
      
      // Check for permission errors
      if (uploadError.message?.includes("permission") || uploadError.message?.includes("policy") || uploadError.statusCode === 403) {
        return NextResponse.json(
          { 
            error: "Permission denied. Check RLS policies for storage.objects",
            details: uploadError.message || JSON.stringify(uploadError)
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Image upload failed",
          details: uploadError.message || JSON.stringify(uploadError),
          statusCode: uploadError.statusCode
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("profile-images").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;
    
    console.log("Upload successful:", { publicUrl, filePath });

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
      // Delete old image if exists (optional - we're using upsert: true so it will overwrite)
      // Keeping this for cleanup of old files if needed
      if (profile.profileImageUrl && profile.profileImageUrl !== publicUrl) {
        try {
          const oldPath = profile.profileImageUrl.split("/profile-images/")[1];
          if (oldPath) {
            await supabase.storage.from("profile-images").remove([oldPath]);
          }
        } catch (error) {
          console.warn("Failed to delete old image:", error);
          // Continue anyway
        }
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

