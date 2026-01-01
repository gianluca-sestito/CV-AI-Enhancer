"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Loader2, Check, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function ImportCV() {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const fileName = file.name.toLowerCase();
      const isValidType =
        file.type === "application/pdf" ||
        file.type === "text/markdown" ||
        file.type === "text/plain" ||
        fileName.endsWith(".pdf") ||
        fileName.endsWith(".md") ||
        fileName.endsWith(".markdown");

      if (!isValidType) {
        setStatus("error");
        setMessage("Invalid file type. Only PDF and Markdown files are supported.");
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setStatus("error");
        setMessage("File size exceeds 10MB limit.");
        return;
      }

      setSelectedFile(file);
      setStatus("idle");
      setMessage("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      const isValidType =
        file.type === "application/pdf" ||
        file.type === "text/markdown" ||
        file.type === "text/plain" ||
        fileName.endsWith(".pdf") ||
        fileName.endsWith(".md") ||
        fileName.endsWith(".markdown");

      if (!isValidType) {
        setStatus("error");
        setMessage("Invalid file type. Only PDF and Markdown files are supported.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setStatus("error");
        setMessage("File size exceeds 10MB limit.");
        return;
      }

      setSelectedFile(file);
      setStatus("idle");
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setStatus("idle");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/profile/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import CV");
      }

      setStatus("success");
      setMessage(data.message || "CV import started successfully. Your profile will be updated shortly.");

      // Clear selected file
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh page after a short delay to show updated profile
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Error importing CV:", error);
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Failed to import CV. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setStatus("idle");
    setMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Import CV</CardTitle>
        <CardDescription className="text-sm">
          Upload a PDF or Markdown file to automatically import your CV data. This will replace all
          existing profile data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="border-green-500 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.md,.markdown,application/pdf,text/markdown,text/plain"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
          </p>
          <p className="text-xs text-gray-500">
            PDF or Markdown files up to 10MB
          </p>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Import CV
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          ⚠️ Warning: This will replace all existing profile data including work experiences,
          skills, education, and languages.
        </p>
      </CardContent>
    </Card>
  );
}

