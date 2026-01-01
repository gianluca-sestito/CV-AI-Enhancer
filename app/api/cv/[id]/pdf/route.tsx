import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { marked } from "marked";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { execSync } from "child_process";
import { existsSync } from "fs";
import type { CVData, CVStyles } from "@/lib/types/cv";
import { logger } from "@/lib/utils/logger";

// Default styles matching the frontend
const defaultStyles: CVStyles = {
  global: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    baseFontSize: "11pt",
    lineHeight: "1.6",
    textColor: "#111827",
    backgroundColor: "#ffffff",
    primaryColor: "#111827",
    secondaryColor: "#6b7280",
    borderColor: "#d1d5db",
    baseSpacing: "1rem",
    sectionSpacing: "2rem",
  },
  sections: {
    header: {},
    summary: {},
    experience: {},
    skills: {},
    education: {},
    languages: {},
  },
  elements: {
    h1: {
      fontSize: "30pt",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "8px",
    },
    h2: {
      fontSize: "20pt",
      fontWeight: "bold",
      color: "#111827",
      marginTop: "32px",
      marginBottom: "16px",
      padding: "0 0 8px 0",
    },
    h3: {
      fontSize: "16pt",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "8px",
    },
    p: {
      fontSize: "11pt",
      lineHeight: "1.6",
      color: "#374151",
    },
    badge: {
      fontSize: "14pt",
      fontWeight: "500",
      padding: "4px 12px",
    },
    listItem: {
      fontSize: "11pt",
      lineHeight: "1.6",
      color: "#374151",
      marginBottom: "6px",
    },
  },
};

// Helper function to convert structured CV content to HTML with styles
function convertStructuredContentToHTML(
  data: CVData,
  styles: CVStyles = defaultStyles
): string {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  let html = "";

  const h1Styles = styles.elements.h1;
  const h2Styles = styles.elements.h2;
  const h3Styles = styles.elements.h3;
  const pStyles = styles.elements.p;
  const badgeStyles = styles.elements.badge;
  const listItemStyles = styles.elements.listItem;
  const headerSectionStyles = styles.sections.header;
  const skillsSectionStyles = styles.sections.skills;
  const experienceSectionStyles = styles.sections.experience;
  const summarySectionStyles = styles.sections.summary;
  const educationSectionStyles = styles.sections.education;
  const languagesSectionStyles = styles.sections.languages;

  // Header - Two-column layout matching React component
  if (data.header) {
    const headerMarginBottom = headerSectionStyles.marginBottom || styles.global.sectionSpacing;
    const headerColor = headerSectionStyles.color || styles.global.textColor;
    const headerBg = headerSectionStyles.backgroundColor || "transparent";
    const headerPadding = headerSectionStyles.padding || "0";

    html += `<div style="margin-bottom: ${headerMarginBottom}; display: flex; justify-content: space-between; align-items: flex-start; gap: 32px; color: ${headerColor}; background-color: ${headerBg}; padding: ${headerPadding};">`;
    
    // Left column: Name, role, contacts
    html += `<div style="flex: 1;">`;
    html += `<h1 style="font-size: ${h1Styles.fontSize}; font-weight: ${h1Styles.fontWeight}; color: ${h1Styles.color || styles.global.textColor}; margin: 0 0 ${h1Styles.marginBottom || "8px"} 0; line-height: 1.2;">${escapeHtml(data.header.name)}</h1>`;
    if (data.header.role) {
      html += `<p style="font-size: 18pt; font-weight: 600; color: ${headerColor || styles.global.secondaryColor}; margin: 0 0 8px 0;">${escapeHtml(data.header.role)}</p>`;
    }
    html += `<div style="display: flex; flex-wrap: wrap; gap: 12px; font-size: 14pt; color: ${headerColor || styles.global.secondaryColor};">`;
    if (data.header.location) {
      html += `<span>${escapeHtml(data.header.location)}</span>`;
    }
    if (data.header.email) {
      html += `<span>· ${escapeHtml(data.header.email)}</span>`;
    }
    if (data.header.phone) {
      html += `<span>· ${escapeHtml(data.header.phone)}</span>`;
    }
    html += `</div>`;
    html += `</div>`;

    // Right column: Profile image
    if (data.header.imageUrl) {
      html += `<div style="flex-shrink: 0;">`;
      html += `<img src="${data.header.imageUrl}" alt="Profile" style="width: 96px; height: 96px; border-radius: 50%; border: 2px solid #e5e7eb; object-fit: cover;" />`;
      html += `</div>`;
    }
    html += `</div>`;
  }

  // Summary
  if (data.summary) {
    const summaryMarginTop = summarySectionStyles.marginTop || h2Styles.marginTop || "32px";
    const summaryMarginBottom = summarySectionStyles.marginBottom || styles.global.sectionSpacing;
    const summaryColor = summarySectionStyles.color || pStyles.color || styles.global.textColor;

    const h2Padding = h2Styles.padding || "0 0 8px 0";
    html += `<h2 style="font-size: ${h2Styles.fontSize}; font-weight: ${h2Styles.fontWeight}; color: ${h2Styles.color || styles.global.textColor}; margin-top: ${summaryMarginTop}; margin-bottom: ${h2Styles.marginBottom || "16px"}; padding: ${h2Padding}; border-bottom: 1px solid ${styles.global.borderColor};">Summary</h2>`;
    html += `<p style="font-size: ${pStyles.fontSize}; line-height: ${pStyles.lineHeight || styles.global.lineHeight}; color: ${summaryColor}; margin-bottom: ${summaryMarginBottom};">${escapeHtml(data.summary)}</p>`;
  }

  // Professional Experience
  if (data.experiences && data.experiences.length > 0) {
    const expMarginTop = experienceSectionStyles.marginTop || h2Styles.marginTop || "32px";
    const expColor = experienceSectionStyles.color || styles.global.textColor;

    const expH2Padding = h2Styles.padding || "0 0 8px 0";
    html += `<h2 style="font-size: ${h2Styles.fontSize}; font-weight: ${h2Styles.fontWeight}; color: ${h2Styles.color || styles.global.textColor}; margin-top: ${expMarginTop}; margin-bottom: ${h2Styles.marginBottom || "16px"}; padding: ${expH2Padding}; border-bottom: 1px solid ${styles.global.borderColor};">Professional Experience</h2>`;
    data.experiences.forEach((exp) => {
      const dateRange =
        exp.current || !exp.endDate
          ? `${formatDate(exp.startDate)} — Present`
          : `${formatDate(exp.startDate)} — ${formatDate(exp.endDate)}`;

      if (exp.isBrief) {
        html += `<div style="margin-bottom: 16px;">`;
        html += `<div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">`;
        html += `<div><span style="font-weight: 600; color: ${expColor};">${escapeHtml(exp.position)}</span> <span style="color: ${styles.global.secondaryColor};">· ${escapeHtml(exp.company)}</span></div>`;
        html += `<span style="font-size: 11pt; color: ${styles.global.secondaryColor};">${dateRange}</span>`;
        html += `</div>`;
        html += `</div>`;
      } else {
        html += `<div style="margin-bottom: 24px;">`;
        html += `<div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">`;
        html += `<div><span style="font-weight: 600; color: ${expColor}; font-size: 18pt;">${escapeHtml(exp.company)}</span> <span style="color: ${pStyles.color || styles.global.textColor};">· ${escapeHtml(exp.position)}</span></div>`;
        html += `<span style="font-size: 11pt; color: ${styles.global.secondaryColor}; font-weight: 500;">${dateRange}</span>`;
        html += `</div>`;
        if (exp.achievements && exp.achievements.length > 0) {
          const listColor = experienceSectionStyles.color || listItemStyles.color || pStyles.color || styles.global.textColor;
          html += `<ul style="margin-left: 20px; margin-top: 8px; padding-left: 0; list-style: disc; color: ${listColor};">`;
          exp.achievements.forEach((achievement: string) => {
            html += `<li style="font-size: ${listItemStyles.fontSize || pStyles.fontSize}; line-height: ${listItemStyles.lineHeight || pStyles.lineHeight || styles.global.lineHeight}; margin-bottom: ${listItemStyles.marginBottom || "6px"};">${escapeHtml(achievement)}</li>`;
          });
          html += `</ul>`;
        }
        html += `</div>`;
      }
    });
  }

  // Technical Skills - Display as badges matching React component
  if (data.skillGroups && data.skillGroups.length > 0) {
    const skillsMarginTop = skillsSectionStyles.marginTop || h2Styles.marginTop || "32px";
    const skillsMarginBottom = skillsSectionStyles.marginBottom || styles.global.sectionSpacing;
    const skillsColor = skillsSectionStyles.color || styles.global.textColor;

    const skillsH2Padding = h2Styles.padding || "0 0 8px 0";
    html += `<h2 style="font-size: ${h2Styles.fontSize}; font-weight: ${h2Styles.fontWeight}; color: ${h2Styles.color || styles.global.textColor}; margin-top: ${skillsMarginTop}; margin-bottom: ${h2Styles.marginBottom || "16px"}; padding: ${skillsH2Padding}; border-bottom: 1px solid ${styles.global.borderColor};">Technical Skills</h2>`;
    html += `<div style="margin-bottom: ${skillsMarginBottom};">`;
    data.skillGroups.forEach((group) => {
      html += `<div style="margin-bottom: 16px;">`;
      html += `<h3 style="font-size: ${h3Styles.fontSize}; font-weight: ${h3Styles.fontWeight}; color: ${h3Styles.color || skillsColor || styles.global.textColor}; margin-bottom: ${h3Styles.marginBottom || "8px"};">${escapeHtml(group.category)}</h3>`;
      html += `<div style="display: flex; flex-wrap: wrap; gap: 8px;">`;
      group.skills.forEach((skill: string) => {
        const badgeColor = skillsSectionStyles.color || badgeStyles.color || skillsColor || styles.global.textColor;
        html += `<span style="display: inline-block; padding: ${badgeStyles.padding || "4px 12px"}; background-color: #f3f4f6; color: ${badgeColor}; border-radius: 6px; font-size: ${badgeStyles.fontSize}; font-weight: ${badgeStyles.fontWeight};">${escapeHtml(skill)}</span>`;
      });
      html += `</div>`;
      html += `</div>`;
    });
    html += `</div>`;
  }

  // Education
  if (data.education && data.education.length > 0) {
    const eduMarginTop = educationSectionStyles.marginTop || h2Styles.marginTop || "32px";
    const eduMarginBottom = educationSectionStyles.marginBottom || styles.global.sectionSpacing;
    const eduColor = educationSectionStyles.color || styles.global.textColor;

    const eduH2Padding = h2Styles.padding || "0 0 8px 0";
    html += `<h2 style="font-size: ${h2Styles.fontSize}; font-weight: ${h2Styles.fontWeight}; color: ${h2Styles.color || styles.global.textColor}; margin-top: ${eduMarginTop}; margin-bottom: ${h2Styles.marginBottom || "16px"}; padding: ${eduH2Padding}; border-bottom: 1px solid ${styles.global.borderColor};">Education</h2>`;
    html += `<div style="margin-bottom: ${eduMarginBottom};">`;
    data.education.forEach((edu) => {
      const dateRange =
        edu.current || !edu.endDate
          ? `${formatDate(edu.startDate)} — Present`
          : `${formatDate(edu.startDate)} — ${formatDate(edu.endDate)}`;

      html += `<div style="margin-bottom: 16px;">`;
      html += `<div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">`;
      let degreeText = `<span style="font-weight: 600; color: ${eduColor};">${escapeHtml(edu.degree)}</span>`;
      if (edu.fieldOfStudy) {
        degreeText += ` <span style="color: ${styles.global.secondaryColor};">in ${escapeHtml(edu.fieldOfStudy)}</span>`;
      }
      html += `<div>${degreeText} <span style="color: ${styles.global.secondaryColor};">· ${escapeHtml(edu.institution)}</span></div>`;
      html += `<span style="font-size: 11pt; color: ${styles.global.secondaryColor};">${dateRange}</span>`;
      html += `</div>`;
      if (edu.description) {
        html += `<p style="font-size: ${pStyles.fontSize}; color: ${eduColor || pStyles.color || styles.global.textColor}; margin-top: 4px;">${escapeHtml(edu.description)}</p>`;
      }
      html += `</div>`;
    });
    html += `</div>`;
  }

  // Languages
  if (data.languages && data.languages.length > 0) {
    const langMarginTop = languagesSectionStyles.marginTop || h2Styles.marginTop || "32px";
    const langMarginBottom = languagesSectionStyles.marginBottom || styles.global.sectionSpacing;
    const langColor = languagesSectionStyles.color || pStyles.color || styles.global.textColor;

    const langH2Padding = h2Styles.padding || "0 0 8px 0";
    html += `<h2 style="font-size: ${h2Styles.fontSize}; font-weight: ${h2Styles.fontWeight}; color: ${h2Styles.color || styles.global.textColor}; margin-top: ${langMarginTop}; margin-bottom: ${h2Styles.marginBottom || "16px"}; padding: ${langH2Padding}; border-bottom: 1px solid ${styles.global.borderColor};">Languages</h2>`;
    html += `<div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: ${langMarginBottom};">`;
    data.languages.forEach((lang) => {
      html += `<div style="color: ${langColor};">`;
      html += `<span style="font-weight: 500;">${escapeHtml(lang.name)}</span>`;
      html += `<span style="color: ${styles.global.secondaryColor};"> — ${escapeHtml(lang.proficiencyLevel)}</span>`;
      html += `</div>`;
    });
    html += `</div>`;
  }

  return html;
}

function escapeHtml(text: string): string {
  if (!text) return "";
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function mergeStyles(defaults: CVStyles, overrides: Partial<CVStyles>): CVStyles {
  return {
    global: { ...defaults.global, ...(overrides.global || {}) },
    sections: {
      header: { ...defaults.sections.header, ...(overrides.sections?.header || {}) },
      summary: { ...defaults.sections.summary, ...(overrides.sections?.summary || {}) },
      experience: { ...defaults.sections.experience, ...(overrides.sections?.experience || {}) },
      skills: { ...defaults.sections.skills, ...(overrides.sections?.skills || {}) },
      education: { ...defaults.sections.education, ...(overrides.sections?.education || {}) },
      languages: { ...defaults.sections.languages, ...(overrides.sections?.languages || {}) },
    },
    elements: {
      h1: { ...defaults.elements.h1, ...(overrides.elements?.h1 || {}) },
      h2: { ...defaults.elements.h2, ...(overrides.elements?.h2 || {}) },
      h3: { ...defaults.elements.h3, ...(overrides.elements?.h3 || {}) },
      p: { ...defaults.elements.p, ...(overrides.elements?.p || {}) },
      badge: { ...defaults.elements.badge, ...(overrides.elements?.badge || {}) },
      listItem: { ...defaults.elements.listItem, ...(overrides.elements?.listItem || {}) },
    },
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let browser;
  
  try {
    const user = await requireAuth();
    const { id } = await params;

    const cv = await prisma.generatedCV.findUnique({
      where: { id },
      include: {
        jobDescription: true,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    if (cv.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (cv.status !== "completed") {
      return NextResponse.json(
        { error: "CV not ready" },
        { status: 400 }
      );
    }

    // Check for structured content (new format) or markdown content (legacy)
    const structuredContent = cv.structuredContent as CVData | null;
    const markdownContent = cv.markdownContent;

    if (!structuredContent && !markdownContent) {
      return NextResponse.json(
        { error: "CV content is invalid" },
        { status: 400 }
      );
    }

    // Generate HTML from structured content or markdown
    let htmlContent: string;
    
    if (structuredContent) {
      // Load styles from database if available, otherwise use defaults
      let cvStyles = defaultStyles;
      
      if (cv.styles) {
        try {
          const storedStyles = cv.styles as Partial<CVStyles>;
          cvStyles = mergeStyles(defaultStyles, storedStyles) as CVStyles;
        } catch (error) {
          logger.error("Error parsing styles from database", error);
          // Fall back to default styles if parsing fails
        }
      }

      // Convert structured content to HTML with styles
      htmlContent = convertStructuredContentToHTML(structuredContent, cvStyles);
    } else if (markdownContent) {
      // Legacy: Convert markdown to HTML
      htmlContent = marked.parse(markdownContent, {
        breaks: true,
        gfm: true,
      }) as string;
    } else {
      return NextResponse.json(
        { error: "CV content is invalid" },
        { status: 400 }
      );
    }

    // Create styled HTML document
    const htmlDocument = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - ${cv.jobDescription.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #111827;
      padding: 0;
      margin: 0;
      background: white;
    }
    
    .cv-container {
      max-width: 896px;
      margin: 0 auto;
      padding: 32px 32px;
    }
    
    h1 {
      font-size: 30pt;
      font-weight: bold;
      margin: 0;
      color: #111827;
      line-height: 1.2;
    }
    
    h2 {
      font-size: 20pt;
      font-weight: bold;
      margin-top: 32px;
      margin-bottom: 16px;
      color: #111827;
      border-bottom: 1px solid #d1d5db;
      padding-bottom: 8px;
    }
    
    h3 {
      font-size: 16pt;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 8px;
      color: #111827;
    }
    
    h4 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 10pt;
      margin-bottom: 5pt;
      color: #4a4a4a;
    }
    
    p {
      margin-bottom: 8pt;
      line-height: 1.6;
    }
    
    ul, ol {
      margin-left: 20pt;
      margin-bottom: 8pt;
    }
    
    li {
      margin-bottom: 4pt;
      line-height: 1.5;
    }
    
    strong {
      font-weight: bold;
    }
    
    em {
      font-style: italic;
    }
    
    a {
      color: #0066cc;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    img {
      max-width: 100%;
      height: auto;
      margin: 10pt 0;
    }
    
    hr {
      border: none;
      border-top: 1pt solid #ccc;
      margin: 16pt 0;
    }
    
    code {
      background-color: #f5f5f5;
      padding: 2pt 4pt;
      border-radius: 3pt;
      font-family: 'Courier New', monospace;
      font-size: 10pt;
    }
    
    pre {
      background-color: #f5f5f5;
      padding: 10pt;
      border-radius: 4pt;
      overflow-x: auto;
      margin-bottom: 8pt;
    }
    
    pre code {
      background: none;
      padding: 0;
    }
    
    blockquote {
      border-left: 3pt solid #ccc;
      padding-left: 10pt;
      margin-left: 10pt;
      color: #666;
      font-style: italic;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8pt;
    }
    
    th, td {
      border: 1pt solid #ddd;
      padding: 6pt;
      text-align: left;
    }
    
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      @page {
        size: A4;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="cv-container">
    ${htmlContent}
  </div>
</body>
</html>
    `;

    // Launch browser with Chromium
    // For serverless environments, use @sparticuz/chromium
    // For local development, use system Chrome or provided executable path
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    // Configure Chromium for serverless
    if (isServerless && chromium) {
      try {
        if ('setGraphicsMode' in chromium && typeof (chromium as any).setGraphicsMode === 'function') {
          (chromium as any).setGraphicsMode(false);
        }
      } catch (e) {
        // Ignore if method doesn't exist
      }
    }
    
    // Determine executable path for local development
    let executablePath: string | undefined;
    
    if (isServerless) {
      executablePath = await chromium.executablePath();
    } else {
      // For local development, try environment variable first
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      } else {
        // Try common Chrome/Chromium installation paths
        const platform = process.platform;
        
        const commonPaths = {
          darwin: [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Chromium.app/Contents/MacOS/Chromium',
          ],
          linux: [
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
          ],
          win32: [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          ],
        };
        
        const pathsToTry = commonPaths[platform as keyof typeof commonPaths] || [];
        
        // Try to find Chrome executable
        for (const path of pathsToTry) {
          try {
            if (existsSync(path)) {
              executablePath = path;
              break;
            }
          } catch {
            // Continue to next path
          }
        }
        
        // If still not found, try using 'which' command on Unix systems
        if (!executablePath && (platform === 'darwin' || platform === 'linux')) {
          try {
            const whichPath = execSync('which google-chrome || which chromium || which chromium-browser', { encoding: 'utf8' }).trim();
            if (whichPath) {
              executablePath = whichPath;
            }
          } catch {
            // Chrome not found in PATH
          }
        }
        
        // If still not found, throw a helpful error
        if (!executablePath) {
          throw new Error(
            'Chrome/Chromium executable not found. Please set PUPPETEER_EXECUTABLE_PATH environment variable ' +
            'to the path of your Chrome/Chromium installation, or install Chrome/Chromium on your system.'
          );
        }
      }
    }
    
    browser = await puppeteer.launch({
      args: isServerless 
        ? chromium.args 
        : ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      defaultViewport: isServerless 
        ? { width: 1200, height: 800 }
        : { width: 1200, height: 800 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    
    // Set content and wait for it to load
    await page.setContent(htmlDocument, {
      waitUntil: "networkidle0",
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cv-${cv.jobDescription.title.replace(/[^a-z0-9]/gi, "_")}-${id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (error: unknown) {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    logger.error("PDF generation error", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate PDF",
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
