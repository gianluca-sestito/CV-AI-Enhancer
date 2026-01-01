import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { triggerClient } from "@/lib/trigger/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    let acceptedType: "pdf" | "markdown" | null = null;

    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      acceptedType = "pdf";
    } else if (
      fileType === "text/markdown" ||
      fileType === "text/plain" ||
      fileName.endsWith(".md") ||
      fileName.endsWith(".markdown")
    ) {
      acceptedType = "markdown";
    } else {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and Markdown files are supported." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Upload file to Supabase Storage to get a public URL
    const supabase = createAdminClient();
    const fileExt = file.name.split(".").pop();
    const storageFileName = `cv-imports/${user.id}/${Date.now()}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    // Use profile-images bucket (should allow PDFs, but if it has MIME restrictions, we may need a separate bucket)
    logger.info("Uploading file to storage", {
      fileName: file.name,
      fileType: acceptedType,
      storageFileName,
      contentType: file.type,
      fileSize: file.size,
      userId: user.id,
    });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(storageFileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      logger.error("Upload error details", uploadError, {
        message: uploadError.message,
        error: uploadError,
        storageFileName,
        userId: user.id,
      });

      // Check if bucket doesn't exist
      if (
        uploadError.message?.includes("Bucket not found") ||
        uploadError.message?.includes("The resource was not found")
      ) {
        return NextResponse.json(
          {
            error:
              "Storage bucket 'profile-images' not found. Please create it in Supabase Dashboard: Storage > New Bucket > Name: 'profile-images' > Public bucket",
            details: uploadError.message,
          },
          { status: 400 }
        );
      }

      // Check for permission errors
      if (
        uploadError.message?.includes("permission") ||
        uploadError.message?.includes("policy")
      ) {
        return NextResponse.json(
          {
            error: "Permission denied. Check RLS policies for storage.objects",
            details: uploadError.message || JSON.stringify(uploadError),
          },
          { status: 403 }
        );
      }

      // Check for MIME type restrictions
      if (
        uploadError.message?.includes("MIME type") ||
        uploadError.message?.includes("content type") ||
        uploadError.message?.includes("not allowed") ||
        uploadError.message?.includes("Invalid file type")
      ) {
        return NextResponse.json(
          {
            error:
              "File type not allowed. The bucket has MIME type restrictions. Run this SQL in Supabase SQL Editor to fix: UPDATE storage.buckets SET file_size_limit = 10485760, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/markdown', 'text/plain'] WHERE id = 'profile-images';",
            details: uploadError.message || JSON.stringify(uploadError),
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to upload file",
          details: uploadError.message || JSON.stringify(uploadError),
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("profile-images")
      .getPublicUrl(storageFileName);
    
    const fileUrl = urlData?.publicUrl;
    
    if (!fileUrl) {
      logger.error("Failed to get public URL", undefined, { uploadData, urlData });
      return NextResponse.json(
        {
          error: "Failed to generate file URL",
          details: "Could not get public URL from storage",
        },
        { status: 500 }
      );
    }

    logger.info("File uploaded successfully", {
      fileName: file.name,
      fileType: acceptedType,
      fileUrl,
      fileSize: file.size,
    });

    // For markdown files, we can also pass the text content directly
    // But for PDFs, we'll pass the URL to the LLM
    let fileContent: string | undefined;
    if (acceptedType === "markdown") {
      // For markdown, decode the text for direct processing
      fileContent = buffer.toString("utf-8");
    }

    // Trigger import task with URL (and content for markdown)
    const taskPayload = {
      userId: user.id,
      fileUrl,
      fileContent, // Only for markdown files
      fileType: acceptedType,
      fileName: file.name,
    };

    logger.info("Triggering import task with payload", {
      ...taskPayload,
      fileContent: fileContent ? `${fileContent.length} chars` : undefined,
    });

    await triggerClient.triggerCVImport(taskPayload);

    return NextResponse.json({
      success: true,
      message: "CV import started. Your profile will be updated shortly.",
      status: "processing",
    });
  } catch (error: unknown) {
    logger.error("Error importing CV", error);

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json(
      {
        error: "Failed to start CV import",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

