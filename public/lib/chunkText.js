// Splits study text into chunks of about 600–800 words, cutting at paragraph breaks.
const TARGET = 600;
const MAX = 800;
const MIN_LEFTOVER = 200;

const countWords = (text) => (text.match(/\S+/g) ?? []).length;

export function chunkText(text) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .flatMap(splitLongParagraph);

  const chunks = [];
  let current = [];
  let words = 0;

  for (const paragraph of paragraphs) {
    const size = countWords(paragraph);
    if (words > 0 && words + size > MAX) {
      chunks.push(current.join("\n\n"));
      current = [];
      words = 0;
    }
    current.push(paragraph);
    words += size;
    if (words >= TARGET) {
      chunks.push(current.join("\n\n"));
      current = [];
      words = 0;
    }
  }

  if (current.length) {
    // A small leftover joins the chunk before it.
    if (chunks.length && words < MIN_LEFTOVER) chunks[chunks.length - 1] += "\n\n" + current.join("\n\n");
    else chunks.push(current.join("\n\n"));
  }
  return chunks;
}

// A paragraph over MAX words is cut at sentence ends.
function splitLongParagraph(paragraph) {
  if (countWords(paragraph) <= MAX) return [paragraph];
  const sentences = paragraph.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) ?? [paragraph];
  const pieces = [];
  let piece = "";
  for (const sentence of sentences) {
    if (piece && countWords(piece + sentence) > TARGET) {
      pieces.push(piece.trim());
      piece = "";
    }
    piece += sentence;
  }
  if (piece.trim()) pieces.push(piece.trim());
  return pieces;
}

export { countWords };
