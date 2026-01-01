/**
 * Extracts text content from a PDF file using pdf2json
 * @param pdfBuffer - Buffer containing PDF file data
 * @returns Extracted text content as string
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Use createRequire to load CommonJS module in ESM context
      const { createRequire } = await import("node:module");
      const require = createRequire(import.meta.url);
      const PDFParser = require("pdf2json");
      
      // Create parser instance (no parameters needed per documentation)
      const pdfParser = new PDFParser();
      
      // Collect all text from the PDF
      let extractedText = "";
      
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        reject(new Error(`PDF parsing error: ${errData.parserError || JSON.stringify(errData)}`));
      });
      
      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          // Extract text from all pages
          // pdf2json structure: pdfData.Pages[].Texts[].R[].T
          if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
            for (const page of pdfData.Pages) {
              if (page.Texts && Array.isArray(page.Texts)) {
                for (const textItem of page.Texts) {
                  if (textItem.R && Array.isArray(textItem.R)) {
                    for (const run of textItem.R) {
                      if (run.T) {
                        // Decode URI-encoded text (pdf2json encodes text as URI)
                        try {
                          extractedText += decodeURIComponent(run.T) + " ";
                        } catch {
                          // If decoding fails, use the text as-is
                          extractedText += run.T + " ";
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          
          resolve(extractedText.trim());
        } catch (error) {
          reject(new Error(`Failed to extract text: ${error instanceof Error ? error.message : "Unknown error"}`));
        }
      });
      
      // Parse the PDF buffer
      pdfParser.parseBuffer(pdfBuffer);
    } catch (error) {
      reject(new Error(
        `Failed to initialize PDF parser: ${error instanceof Error ? error.message : "Unknown error"}`
      ));
    }
  });
}

