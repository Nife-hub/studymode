// Reads the text out of a PDF, in the browser, using PDF.js served from /vendor/pdfjs/.
import { countWords } from "./chunkText.js";

export const UNUSABLE_FILE = "We couldn't read text from this file. Try another PDF, or paste your text below.";
const MIN_WORDS = 50;

export async function readPdf(file) {
  if (!file || !(file.type === "application/pdf" || /\.pdf$/i.test(file.name))) {
    throw new Error(UNUSABLE_FILE);
  }

  const pdfjs = await import("/vendor/pdfjs/pdf.min.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";

  let text;
  try {
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    text = await extractText(pdf);
  } catch {
    throw new Error(UNUSABLE_FILE);
  }

  // A scanned PDF has pictures of text, not text, so almost nothing comes out.
  if (countWords(text) < MIN_WORDS) throw new Error(UNUSABLE_FILE);
  return text;
}

// Joins every page's text. A big vertical gap between lines becomes a paragraph break,
// so the chunker can cut at paragraphs.
export async function extractText(pdf) {
  const pages = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const { items } = await page.getTextContent();
    let out = "";
    let lastY = null;
    let lineHeight = 12;
    for (const item of items) {
      if (!("str" in item)) continue;
      const y = item.transform[5];
      if (item.height) lineHeight = item.height;
      if (lastY !== null && lastY - y > lineHeight * 1.8) out += "\n\n";
      else if (lastY !== null && Math.abs(lastY - y) > 1 && !out.endsWith(" ") && !out.endsWith("\n")) out += " ";
      out += item.str;
      if (item.hasEOL && !out.endsWith("\n")) out += " ";
      lastY = y;
    }
    pages.push(out.trim());
  }
  return pages.filter(Boolean).join("\n\n");
}
