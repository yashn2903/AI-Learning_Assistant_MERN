import { PDFParse } from "pdf-parse";

/**
 * Extract text from a PDF buffer
 * @param {Buffer|Uint8Array} dataBuffer - Raw PDF bytes
 * @returns {Promise<{extractedText: string, numPages: number, info: Object}>}
 */
export const extractTextFromPDF = async (dataBuffer) => {
  try {
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
