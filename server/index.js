// The helper server: hands the page to the browser and keeps the Claude API key private.
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeStudyRound } from "./studyRound.js";

const PORT = Number(process.env.PORT) || 3000;
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const FRIENDLY_ERROR = "We couldn't prepare this chunk. Check your connection and try again.";

const app = express();
app.use(express.json({ limit: "1mb" }));

// 1. The page itself.
app.use(express.static(path.join(root, "public")));
// 2. PDF.js's browser files, straight from node_modules.
app.use("/vendor/pdfjs", express.static(path.join(root, "node_modules/pdfjs-dist/build")));

// 3. One chunk in, one study round out.
app.post("/api/study-round", async (req, res) => {
  const { chunkText, chunkNumber = 1, totalChunks = 1 } = req.body ?? {};
  if (typeof chunkText !== "string" || !chunkText.trim()) {
    return res.status(400).json({ error: "No text was sent to study." });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("\n  ANTHROPIC_API_KEY is missing. Copy .env.example to .env, paste your key, and restart.\n");
    return res.status(500).json({ error: FRIENDLY_ERROR });
  }

  console.log(`Preparing chunk ${chunkNumber} of ${totalChunks}…`);
  try {
    const round = await makeStudyRound({ chunkText, chunkNumber, totalChunks });
    console.log(`Chunk ${chunkNumber} ready.`);
    res.json(round);
  } catch (err) {
    console.error(`Chunk ${chunkNumber} failed:`, err.message);
    res.status(500).json({ error: FRIENDLY_ERROR });
  }
});

app.listen(PORT, () => {
  console.log(`StudyMode is running at http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("  Note: no ANTHROPIC_API_KEY yet. Copy .env.example to .env and paste your key.");
  }
});
