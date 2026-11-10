// Reads the text out of a Word document (.docx), in the browser, using mammoth
// served from /vendor/mammoth/. Old .doc files are a different format it can't read.
import { countWords } from "./chunkText.js";

export const UNUSABLE_DOCX = "We couldn't read text from this file. Try another Word document, or pick Paste text instead.";
export const OLD_DOC =
  "This looks like an older Word file (.doc). Open it in Word and save it as .docx, or pick Paste text instead.";
const MIN_WORDS = 50;

// mammoth's browser file is a classic script that sets window.mammoth, so it's added as a <script> once.
let loading;
function loadMammoth() {
  loading ??= new Promise((resolve, reject) => {
    if (window.mammoth) return resolve(window.mammoth);
    const script = document.createElement("script");
    script.src = "/vendor/mammoth/mammoth.browser.min.js";
    script.onload = () => resolve(window.mammoth);
    script.onerror = () => {
      loading = null;
      reject(new Error(UNUSABLE_DOCX));
    };
    document.head.append(script);
  });
  return loading;
}

export async function readDocx(file) {
  if (file && /\.doc$/i.test(file.name)) throw new Error(OLD_DOC);
  if (!file || !/\.docx$/i.test(file.name)) throw new Error(UNUSABLE_DOCX);

  let text;
  try {
    const mammoth = await loadMammoth();
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    text = result.value;
  } catch {
    throw new Error(UNUSABLE_DOCX);
  }

  if (countWords(text) < MIN_WORDS) throw new Error(UNUSABLE_DOCX);
  return text;
}
