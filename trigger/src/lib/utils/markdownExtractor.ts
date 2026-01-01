import { marked } from "marked";

/**
 * Extracts text content from Markdown
 * @param markdownContent - Markdown string
 * @returns Extracted plain text content
 */
export async function extractTextFromMarkdown(markdownContent: string): Promise<string> {
  try {
    // Convert markdown to plain text by stripping HTML tags
    const html = await marked.parse(markdownContent);
    // Remove HTML tags and get plain text
    const text = html.replace(/<[^>]*>/g, "").replace(/\n+/g, "\n").trim();
    return text;
  } catch (error) {
    throw new Error(`Failed to extract text from Markdown: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}


