// The helper server: hands the page to the browser and keeps the Claude API key private.
import "./loadEnv.js";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeStudyRound } from "./studyRound.js";
import { readArticle, ArticleError, CANT_READ } from "./article.js";
import { accountsOn, publicConfig, whoIsAsking } from "./auth.js";

const PORT = Number(process.env.PORT) || 3000;
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const FRIENDLY_ERROR = "We couldn't prepare this chunk. Check your connection and try again.";

const app = express();
app.use(express.json({ limit: "1mb" }));

// 1. The page itself.
app.use(express.static(path.join(root, "public")));
// 2. PDF.js's browser files, straight from node_modules.
app.use("/vendor/pdfjs", express.static(path.join(root, "node_modules/pdfjs-dist/build")));
// 3. mammoth's browser file, for reading Word documents.
app.get("/vendor/mammoth/mammoth.browser.min.js", (req, res) => {
  res.type("text/javascript").sendFile(path.join(root, "node_modules/mammoth/mammoth.browser.min.js"));
});

// 4. Supabase's browser library, for signing in.
app.get("/vendor/supabase/supabase.js", (req, res) => {
  res.type("text/javascript").sendFile(path.join(root, "node_modules/@supabase/supabase-js/dist/umd/supabase.js"));
});

// 5. What the page needs to talk to Supabase (empty when accounts are off).
app.get("/api/config", (req, res) => res.json(publicConfig()));

// 6. One chunk in, one study round out.
app.post("/api/study-round", async (req, res) => {
  const { chunkText, chunkNumber = 1, totalChunks = 1 } = req.body ?? {};
  if (typeof chunkText !== "string" || !chunkText.trim()) {
    return res.status(400).json({ error: "No text was sent to study." });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("\n  ANTHROPIC_API_KEY is missing. Copy .env.example to .env, paste your key, and restart.\n");
    return res.status(500).json({ error: FRIENDLY_ERROR });
  }

  const person = await whoIsAsking(req);
  console.log(`Preparing chunk ${chunkNumber} of ${totalChunks} (${person ? "signed in" : "guest"})…`);
  try {
    const round = await makeStudyRound({ chunkText, chunkNumber, totalChunks });
    console.log(`Chunk ${chunkNumber} ready.`);
    res.json(round);
  } catch (err) {
    console.error(`Chunk ${chunkNumber} failed:`, err.message);
    res.status(500).json({ error: FRIENDLY_ERROR });
  }
});

// 7. A link in, the article's title and text out.
app.post("/api/article", async (req, res) => {
  const link = req.body?.url;
  console.log(`Reading article: ${String(link).slice(0, 200)}`);
  try {
    res.json(await readArticle(link));
    console.log("Article ready.");
  } catch (err) {
    const known = err instanceof ArticleError;
    console.error(`Article failed: ${known ? err.reason : err.message}`);
    res.status(422).json({ error: known ? err.message : CANT_READ });
  }
});

app.listen(PORT, () => {
  console.log(`StudyMode is running at http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("  Note: no ANTHROPIC_API_KEY yet. Copy .env.example to .env and paste your key.");
  }
  console.log(accountsOn ? "  Accounts are on (Supabase)." : "  Accounts are off: no SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY in .env.");
});
