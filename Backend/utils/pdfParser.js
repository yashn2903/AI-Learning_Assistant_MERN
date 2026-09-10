/**
 * pdf-parse loads pdfjs-dist, which needs two things Vercel's dependency
 * tracer cannot discover on its own, because pdfjs reaches for both through
 * guarded/computed imports that static analysis cannot follow:
 *
 *   1. @napi-rs/canvas, for the browser globals DOMMatrix/ImageData/Path2D
 *   2. pdf.worker.mjs, which it loads by absolute path as a "fake worker"
 *
 * Both get pruned from the deployed bundle unless something references them
 * explicitly. Importing them here keeps them in the output and lets us install
 * the globals ourselves instead of relying on pdfjs's internal detection.
 */
let readyPromise;

const ensurePdfRuntime = () => {
  if (!readyPromise) {
    readyPromise = (async () => {
      try {
        const canvas = await import('@napi-rs/canvas');
        for (const name of ['DOMMatrix', 'ImageData', 'Path2D']) {
          if (!globalThis[name] && canvas[name]) {
            globalThis[name] = canvas[name];
          }
        }
      } catch (error) {
        console.error('Could not load canvas polyfills:', error.message);
      }

      try {
        // Referenced only so the bundler ships pdf.worker.mjs alongside pdf.mjs.
        await import('pdfjs-dist/legacy/build/pdf.worker.mjs');
      } catch (error) {
        console.error('Could not preload the pdfjs worker:', error.message);
      }
    })();
  }
  return readyPromise;
};

/**
 * Extract text from a PDF buffer
 * @param {Buffer|Uint8Array} dataBuffer - Raw PDF bytes
 * @returns {Promise<{extractedText: string, numPages: number, info: Object}>}
 */
export const extractTextFromPDF = async (dataBuffer) => {
  try {
    await ensurePdfRuntime();

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
