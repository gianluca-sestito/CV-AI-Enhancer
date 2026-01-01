import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@/lib/prisma/client";
import { marked } from "marked";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

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

    if (!cv.markdownContent || typeof cv.markdownContent !== "string") {
      return NextResponse.json(
        { error: "CV content is invalid" },
        { status: 400 }
      );
    }

    // Convert markdown to HTML
    const htmlContent = await marked(cv.markdownContent, {
      breaks: true,
      gfm: true,
    });

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
      color: #333;
      padding: 40px;
      max-width: 210mm;
      margin: 0 auto;
      background: white;
    }
    
    h1 {
      font-size: 24pt;
      font-weight: bold;
      margin-bottom: 10pt;
      margin-top: 16pt;
      color: #1a1a1a;
    }
    
    h2 {
      font-size: 18pt;
      font-weight: bold;
      margin-top: 16pt;
      margin-bottom: 8pt;
      color: #2a2a2a;
      border-bottom: 1pt solid #e0e0e0;
      padding-bottom: 4pt;
    }
    
    h3 {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 12pt;
      margin-bottom: 6pt;
      color: #3a3a3a;
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
  ${htmlContent}
</body>
</html>
    `;

    // Launch browser with Chromium
    // For serverless environments, use @sparticuz/chromium
    // For local development, it will fall back to system Chrome if available
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    // Configure Chromium for serverless (if method exists)
    if (isServerless && chromium && typeof chromium.setGraphicsMode === 'function') {
      chromium.setGraphicsMode(false);
    }
    
    browser = await puppeteer.launch({
      args: isServerless 
        ? chromium.args 
        : ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      defaultViewport: isServerless 
        ? chromium.defaultViewport 
        : { width: 1200, height: 800 },
      executablePath: isServerless 
        ? await chromium.executablePath() 
        : process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
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

    return new NextResponse(pdfBuffer, {
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
    console.error("PDF generation error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate PDF",
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
