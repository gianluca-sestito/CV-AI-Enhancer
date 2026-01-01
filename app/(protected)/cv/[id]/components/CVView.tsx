"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, Save, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import CVEditorControls from "./CVEditorControls";
import {
  CVEditorSettings,
  defaultSettings,
  loadSettings,
  saveSettings,
} from "./CVEditorSettings";
import { cn } from "@/lib/utils";
import "./CVView.module.css";

interface GeneratedCV {
  id: string;
  markdownContent: string;
  status: string;
  jobDescription: {
    title: string;
    company: string | null;
  };
}

export default function CVView({ cv: initialCV }: { cv: GeneratedCV }) {
  const [cv, setCV] = useState(initialCV);
  const [markdownContent, setMarkdownContent] = useState(cv.markdownContent || "");
  const [loading, setLoading] = useState(cv.status === "processing");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isMounted, setIsMounted] = useState(false);
  const [editorSettings, setEditorSettings] = useState<CVEditorSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

  // Ensure component is mounted before rendering ReactMarkdown to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
    // Load saved settings
    const savedSettings = loadSettings(cv.id);
    setEditorSettings(savedSettings);
  }, [cv.id]);

  // Update local markdown when CV updates
  useEffect(() => {
    if (cv.markdownContent !== markdownContent && !isDirty) {
      setMarkdownContent(cv.markdownContent || "");
    }
  }, [cv.markdownContent]);

  // Poll for CV updates if processing
  useEffect(() => {
    if (cv.status === "processing") {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/cv/${cv.id}`);
          if (response.ok) {
            const data = await response.json();
            setCV(data);
            if (data.status === "completed" || data.status === "failed") {
              setLoading(false);
              clearInterval(interval);
              if (data.status === "completed" && data.markdownContent) {
                setMarkdownContent(data.markdownContent);
                setIsDirty(false);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching CV:", error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [cv.id, cv.status]);

  const handleMarkdownChange = (value: string) => {
    setMarkdownContent(value);
    setIsDirty(value !== cv.markdownContent);
    setSaveStatus("idle");
  };

  const handleSave = async () => {
    if (!isDirty) return;

    setIsSaving(true);
    setSaveStatus("saving");

    try {
      const response = await fetch(`/api/cv/${cv.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdownContent }),
      });

      if (!response.ok) throw new Error("Failed to save CV");

      const data = await response.json();
      setCV(data);
      setIsDirty(false);
      setSaveStatus("saved");
      
      // Reset saved status after 2 seconds
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Error saving CV:", error);
      setSaveStatus("idle");
      alert("Failed to save CV. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    window.open(`/api/cv/${cv.id}/pdf`, "_blank");
  };

  // Debounced settings save (skip initial mount)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timeoutId = setTimeout(() => {
      saveSettings(cv.id, editorSettings);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [editorSettings, cv.id]);

  const handleSettingsChange = useCallback((newSettings: CVEditorSettings) => {
    setEditorSettings(newSettings);
  }, []);

  const handleResetSettings = () => {
    setEditorSettings(defaultSettings);
    saveSettings(cv.id, defaultSettings);
  };

  // Generate inline styles based on settings
  const previewStyles = useMemo((): React.CSSProperties => {
    // Font families
    const fontFamilies = {
      serif: {
        body: "'Georgia', 'Times New Roman', serif",
        heading: "'Georgia', 'Times New Roman', serif",
      },
      'sans-serif': {
        body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif",
        heading: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif",
      },
      mixed: {
        body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif",
        heading: "'Georgia', 'Times New Roman', serif",
      },
    };

    // Color schemes
    const colorSchemes = {
      warm: {
        background: '#faf9f6',
        text: '#3d2817',
        primary: '#3d2817',
        secondary: '#6b4e3d',
        border: '#d4c4b0',
      },
      cool: {
        background: '#ffffff',
        text: '#1a1a1a',
        primary: '#1e40af',
        secondary: '#64748b',
        border: '#e2e8f0',
      },
      minimal: {
        background: '#ffffff',
        text: '#1a1a1a',
        primary: '#1a1a1a',
        secondary: '#6b7280',
        border: '#f3f4f6',
      },
      custom: editorSettings.customColors ? {
        background: editorSettings.customColors.background,
        text: editorSettings.customColors.text,
        primary: editorSettings.customColors.primary,
        secondary: editorSettings.customColors.secondary,
        border: editorSettings.customColors.secondary,
      } : {
        background: '#ffffff',
        text: '#1a1a1a',
        primary: '#1a1a1a',
        secondary: '#6b7280',
        border: '#f3f4f6',
      },
    };

    // Spacing
    const spacingValues = {
      compact: { base: '0.5rem', heading: '0.75rem', section: '1rem' },
      normal: { base: '1rem', heading: '1.25rem', section: '1.5rem' },
      spacious: { base: '1.5rem', heading: '2rem', section: '2.5rem' },
    };

    // Font sizes
    const fontSizes = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
    };

    const fonts = fontFamilies[editorSettings.fontFamily];
    const colors = colorSchemes[editorSettings.colorScheme];
    const spacing = spacingValues[editorSettings.spacing];
    const fontSize = fontSizes[editorSettings.fontSize];

    // Layout configurations - computed with actual color and spacing values
    const layouts = {
      traditional: {
        padding: '2.5rem',
        maxWidth: '800px',
        textAlign: 'left' as const,
        margin: '0 auto',
        // H1 styles
        h1TextAlign: 'center',
        h1BorderBottom: `3px solid ${colors.primary}`,
        h1PaddingBottom: '1rem',
        h1MarginBottom: '2rem',
        // H2 styles
        h2BorderBottom: `2px solid ${colors.border}`,
        h2PaddingBottom: '0.75rem',
        h2TextTransform: 'uppercase',
        h2LetterSpacing: '0.05em',
        // List styles
        listMarginLeft: '1.5rem',
        listPaddingLeft: '0',
        // HR styles
        hrBorderTop: `2px solid ${colors.border}`,
        hrDisplay: 'block',
      },
      modern: {
        padding: '2rem',
        maxWidth: '100%',
        textAlign: 'left' as const,
        margin: '0',
        // H1 styles
        h1TextAlign: 'left',
        h1BorderBottom: 'none',
        h1PaddingBottom: '0',
        h1MarginBottom: spacing.base,
        // H2 styles
        h2BorderBottom: `1px solid ${colors.border}`,
        h2PaddingBottom: '0.5rem',
        h2TextTransform: 'none',
        h2LetterSpacing: 'normal',
        // List styles
        listMarginLeft: '1.25rem',
        listPaddingLeft: '0.5rem',
        // HR styles
        hrBorderTop: 'none',
        hrDisplay: 'none',
      },
      compact: {
        padding: '1.25rem',
        maxWidth: '100%',
        textAlign: 'left' as const,
        margin: '0',
        // H1 styles
        h1TextAlign: 'left',
        h1BorderBottom: 'none',
        h1PaddingBottom: '0',
        h1MarginBottom: spacing.base,
        // H2 styles
        h2BorderBottom: `1px solid ${colors.border}`,
        h2PaddingBottom: '0.25rem',
        h2TextTransform: 'none',
        h2LetterSpacing: 'normal',
        // List styles
        listMarginLeft: '1rem',
        listPaddingLeft: '0',
        // HR styles
        hrBorderTop: 'none',
        hrDisplay: 'none',
      },
    };

    const layout = layouts[editorSettings.layout];

    const styles: React.CSSProperties = {
      // CSS Variables
      '--cv-font-family-body': fonts.body,
      '--cv-font-family-heading': fonts.heading,
      '--cv-font-size-base': fontSize,
      '--cv-background': colors.background,
      '--cv-text-color': colors.text,
      '--cv-primary-color': colors.primary,
      '--cv-secondary-color': colors.secondary,
      '--cv-border-color': colors.border,
      '--cv-spacing': spacing.base,
      '--cv-heading-spacing': spacing.heading,
      '--cv-section-spacing': spacing.section,
      '--cv-line-height': '1.6',
      // Layout-specific CSS variables
      '--cv-h1-text-align': layout.h1TextAlign,
      '--cv-h1-border-bottom': layout.h1BorderBottom,
      '--cv-h1-padding-bottom': layout.h1PaddingBottom,
      '--cv-h1-margin-bottom': layout.h1MarginBottom,
      '--cv-h2-border-bottom': layout.h2BorderBottom,
      '--cv-h2-padding-bottom': layout.h2PaddingBottom,
      '--cv-h2-text-transform': layout.h2TextTransform,
      '--cv-h2-letter-spacing': layout.h2LetterSpacing,
      '--cv-list-margin-left': layout.listMarginLeft,
      '--cv-list-padding-left': layout.listPaddingLeft,
      '--cv-hr-border-top': layout.hrBorderTop,
      '--cv-hr-display': layout.hrDisplay,
      // Direct styles
      padding: layout.padding,
      maxWidth: layout.maxWidth,
      textAlign: layout.textAlign,
      margin: layout.margin,
      backgroundColor: colors.background,
      color: colors.text,
      fontFamily: fonts.body,
      fontSize: fontSize,
    };
    
    return styles;
  }, [editorSettings]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Generating your CV...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cv.status === "failed") {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Card>
          <CardContent className="py-6">
            <h2 className="text-xl font-bold mb-2">CV Generation Failed</h2>
            <p className="text-destructive mb-4">
              The CV could not be generated. Please try again.
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">CV Editor</h1>
          <p className="text-muted-foreground mt-2">
            Tailored for {cv.jobDescription.title}
            {cv.jobDescription.company && ` at ${cv.jobDescription.company}`}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            variant="default"
            className="w-full sm:w-auto"
          >
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Desktop: Split View */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-4">
        {/* Left: Markdown Editor */}
        <Card className="flex flex-col">
          <CardContent className="p-4 flex-1 flex flex-col">
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              Markdown
            </div>
            <textarea
              value={markdownContent}
              onChange={(e) => handleMarkdownChange(e.target.value)}
              className="flex-1 w-full p-4 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter your CV markdown here..."
            />
          </CardContent>
        </Card>

        {/* Right: Live Preview */}
        <Card className="flex flex-col">
          <CardContent className="p-4 sm:p-6 lg:p-8 flex-1 overflow-auto">
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              Preview
            </div>
            <div 
              className="markdown-preview cv-preview" 
              style={previewStyles}
              suppressHydrationWarning
              data-testid="cv-preview"
            >
              {isMounted ? (
                <ReactMarkdown>{markdownContent}</ReactMarkdown>
              ) : (
                <div className="text-muted-foreground">Loading preview...</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile: Tabs */}
      <div className="lg:hidden">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="mb-2 text-sm font-medium text-muted-foreground">
                  Markdown
                </div>
                <textarea
                  value={markdownContent}
                  onChange={(e) => handleMarkdownChange(e.target.value)}
                  className="w-full h-96 p-4 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter your CV markdown here..."
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="mb-2 text-sm font-medium text-muted-foreground">
                  Preview
                </div>
                <div 
                  className="markdown-preview cv-preview" 
                  style={previewStyles}
                  suppressHydrationWarning
                >
                  {isMounted ? (
                    <ReactMarkdown>{markdownContent}</ReactMarkdown>
                  ) : (
                    <div className="text-muted-foreground">Loading preview...</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Editor Controls */}
      <CVEditorControls
        settings={editorSettings}
        onSettingsChange={handleSettingsChange}
        onReset={handleResetSettings}
        isOpen={showSettings}
        onToggle={() => setShowSettings(!showSettings)}
      />
    </div>
  );
}
