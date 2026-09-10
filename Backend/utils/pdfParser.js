/**
 * pdf-parse loads pdfjs-dist, which expects browser globals (DOMMatrix,
 * ImageData, Path2D). pdfjs tries to polyfill them from @napi-rs/canvas via a
 * guarded require, which Vercel's dependency tracer cannot see - so the package
 * gets pruned from the bundle and the import throws at runtime.
 *
 * Importing @napi-rs/canvas explicitly here does two things: it makes the
 * tracer include the package, and it lets us install the globals ourselves
 * rather than relying on pdfjs's internal detection.
 */
let globalsPromise;

const ensurePdfGlobals = () => {
  if (!globalsPromise) {
    globalsPromise = import('@napi-rs/canvas')
      .then((canvas) => {
        for (const name of ['DOMMatrix', 'ImageData', 'Path2D']) {
          if (!globalThis[name] && canvas[name]) {
            globalThis[name] = canvas[name];
          }
        }
      })
      .catch((error) => {
        console.error('Could not load canvas polyfills:', error.message);
      });
  }
  return globalsPromise;
};

/**
 * Extract text from a PDF buffer
 * @param {Buffer|Uint8Array} dataBuffer - Raw PDF bytes
 * @returns {Promise<{extractedText: string, numPages: number, info: Object}>}
 */
export const extractTextFromPDF = async (dataBuffer) => {
  try {
    await ensurePdfGlobals();

    const { PDFParse } = await import('pdf-parse');

    // pdf-parse expects a Uint8Array, not a Buffer
    const parser = new PDFParse(new Uint8Array(dataBuffer));
    const data = await parser.getText();

    return {
      extractedText: data.text,
      numPages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};
