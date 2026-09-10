/**
 * Extract text from a PDF buffer
 *
 * pdf-parse pulls in pdfjs-dist, which touches browser globals (DOMMatrix,
 * ImageData, Path2D) at import time and polyfills them from @napi-rs/canvas.
 * Importing it lazily keeps a failure there contained to the upload route
 * instead of taking down the whole API at function startup.
 *
 * @param {Buffer|Uint8Array} dataBuffer - Raw PDF bytes
 * @returns {Promise<{extractedText: string, numPages: number, info: Object}>}
 */
export const extractTextFromPDF = async (dataBuffer) => {
  try {
    const { PDFParse } = await import("pdf-parse");

    // pdf-parse expects a Uint8Array, not a Buffer
    const parser = new PDFParse(new Uint8Array(dataBuffer));
    const data = await parser.getText();

    return {
      extractedText: data.text,
      numPages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};
