---
doc: spec
status: approved
---

# StudyMode — Technical Spec

## How This Works, In Plain Language

StudyMode has two parts, and both run on your laptop.

1. **The page you see.** This is the front of the app, built with plain **HTML, CSS, and JavaScript**: the three languages every browser understands, with no extra toolkit. It shows the Opening Page, Home Page, Study Screen, and Finished Screen. It reads the text out of your PDF right in the browser, using a free tool called **PDF.js**, and cuts that text into **chunks** of about 600–800 words.
2. **A small helper program**, called a *server*. It does two jobs:
   - It hands the page to your browser.
   - It holds your secret Claude **API key**, the password that lets a program use Claude and bills your Anthropic account. When the page needs a study round, it sends one chunk to the helper. The helper asks Claude to turn that chunk into key points, flashcards, and a quiz, then sends the answer back. The key never reaches the page, so nobody can copy it from the browser.

A chunk is never shown to you as raw text. It's only what gets handed to Claude behind the scenes. What you see is key points with highlights, then flashcards, then a quiz.

Nothing is saved. The page keeps everything in one JavaScript object called `state` while it's open. Closing the tab ends the session, which matches `prd.md > States and Boundaries > Persistence`.

**Why this shape:** it's the smallest setup that keeps the API key safe. One command starts everything, there's no build step, and there's no database, accounts, or deployment.

## The Core Journey Through the System
Traces `prd.md > The Core Journey`.

1. **You open StudyMode.** Your browser loads the page from the helper at `http://localhost:3000`. The app starts on the **Opening Page**.
2. **You press Get started.** `state.screen` becomes `"home"`, and the page redraws as the **Home Page**. Nothing is sent anywhere yet.
3. **You upload a PDF or paste text.**
   - For a PDF, **PDF.js** reads the text out of each page, in the browser. The file never leaves your laptop.
   - The **chunker** splits the text into chunks of about 600–800 words at paragraph breaks.
   - If there's almost no text (a scanned PDF or the wrong kind of file), you see an error on the Home Page instead.
4. **Loading.** The page sends chunk 1 to the helper at `/api/study-round`. The helper asks Claude for 3–5 key points, 10 flashcards, and 5 quiz questions, all in one reply. While that happens, the **loading icon** shows.
5. **Summary.** The key points appear, with the important terms highlighted. **Create your own flashcard** opens a blank card with a front and a back. You fill it in, and it's kept in `state` for this chunk.
6. **Flashcards.** You pick how many you want, from 1 to 10. The page shows that many of the 10 Claude made, plus your own cards. Tapping a card flips it. No new request is sent to Claude.
7. **Quiz.** The 5 questions show one at a time. When you pick an answer, the page checks it against Claude's correct answer and shows whether you were right or wrong.
8. **Score, then next chunk.** You see the chunk score (for example, 4/5), and the session score goes up. **Next chunk** sends chunk 2 to the helper, and steps 4–8 repeat.
9. **Finished.** After the last chunk's quiz, the **Finished Screen** shows your total score. **Upload another PDF** resets `state` and returns to the Home Page.

```
 Browser (your laptop)                     Helper server (your laptop, port 3000)       Anthropic
┌──────────────────────────────┐  page files  ┌──────────────────────────────┐  API key  ┌────────┐
│ HTML/CSS/JS page             │ <─────────── │ serves public/ + PDF.js      │           │        │
│  PDF.js → chunker → screens  │ ───────────> │ POST /api/study-round        │ ────────> │ Claude │
│                              │ <─────────── │ (holds ANTHROPIC_API_KEY)    │ <──────── │        │
└──────────────────────────────┘  key points, └──────────────────────────────┘   JSON    └────────┘
                                   cards, quiz
```

## Stack

- **Plain HTML, CSS, and JavaScript** for the page you see, using JavaScript *modules* (`import`/`export`) to split the code into files. *Learner's choice, made at review to ship as fast as possible.* It replaces the earlier React + Vite choice. The accepted tradeoff: the page must be redrawn by hand whenever the data changes, so the code follows one simple pattern for that (see **Page pattern**). React may come later (see **Switching to React later**).
  Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules · https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
- **Plain CSS** with color variables in one stylesheet.
  Docs: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- **PDF.js** (`pdfjs-dist` package) reads PDF text in the browser. The helper serves its files from `node_modules`, so there's no build tool and no internet connection needed. *Recommended, accepted.*
  Docs: https://mozilla.github.io/pdf.js/ · https://github.com/mozilla/pdf.js
- **Node.js + Express** for the helper server, which also serves the page files. *Recommended and accepted as part of the two-part setup.*
  Docs: https://nodejs.org · https://expressjs.com
- **Anthropic SDK** (`@anthropic-ai/sdk`) plus **Zod**, which describes the exact shape of the reply we expect from Claude.
  Docs: https://platform.claude.com/docs/en/build-with-claude/structured-outputs · https://github.com/anthropics/anthropic-sdk-typescript · https://zod.dev
- **Claude model:** `claude-opus-5-5`, run at low effort. *Learner's choice at review*, over the cheaper `claude-haiku-5-5`, because Opus writes sharper key points and quiz questions. The accepted tradeoff is about 5¢ per chunk.

Package versions: use the latest stable at build time. **Check early in the build:** loading PDF.js as a browser module from `/vendor/pdfjs/`, and that Node is a current LTS version (24 or newer).

## Where It Runs and How Someone Tries It

- **Runs locally** on the learner's laptop and opens in a browser. *Learner's choice.*
- **Needs:**
  - Node.js (current LTS)
  - an Anthropic **Claude Console** account (platform.claude.com) with prepaid API credit, an API key, and a **monthly spending limit**. A Claude Pro subscription does not cover API use.
- **Setup, once:**
  1. `npm install`
  2. Copy `.env.example` to `.env` and paste the key after `ANTHROPIC_API_KEY=`. `.env` is already in `.gitignore`, so the key never goes to GitHub. Never paste the key into chat.
- **Start:** `npm start` runs the helper with `node --watch`, which restarts it automatically when server code changes. Open **http://localhost:3000**. After editing page files, refresh the browser.
- **Submission:** a short demo video recorded from the local app, plus a public GitHub repository. A README in the repo explains the steps above.
- **Demo to record:**
  1. Opening Page → Get started
  2. Upload a PDF of 3+ pages
  3. Loading → summary with highlights → create one card
  4. Pick 5 cards and flip a couple
  5. Quiz with right and wrong feedback → chunk score
  6. Next chunk appears
  - Keep `sample/sample-notes.pdf` in the repo as a demo PDF that's known to work.
- **Hosting is optional and decided in `6-ship`.** Hosting is free; Claude usage is what costs money, so keep the spending limit. Because the helper is a normal Express app, hosts that run Node apps (for example Render or Railway) can run it as is. Netlify or Vercel would need the single route moved into a serverless function.

## Look and Feel
Implements `prd.md > Look and Feel`. The learner chose dark blues, a light background, and a clean, simple font.

- **Colors**, defined as CSS variables in `public/styles.css`:
  - background `#DCE3EC` (soft cool grey-blue; darkened after the learner found the first one too bright for long sessions)
  - cards and surfaces `#F4F7FA` (off-white, not pure white)
  - main text `#13243B` (dark navy)
  - secondary text `#4B5D74`
  - primary buttons and headings `#1F3B63` (dark blue), hover `#162D4D`
  - soft accent `#D6E2F1`, used for highlighted terms and the selected flashcard count
  - borders `#C5D0DE`
  - feedback, kept muted rather than loud: correct `#2E7558` on `#E3F1EA`, wrong `#A8453D` on `#F6E5E3`
- **Font:** Inter (Google Fonts), falling back to the system sans-serif. Body text at 17–18px with generous line height (1.6) for easy reading.
- **Layout:**
  - One centered column, about 680px wide, with lots of white space.
  - One thing on screen at a time: Summary, Flashcards, and Quiz are separate steps, never stacked.
  - A thin progress line at the top of the Study Screen ("Chunk 2 of 7 · Quiz").
- **Highlighted terms:** shown in bold navy on the soft accent background.
- **Flashcards:** white cards with soft rounded corners and a quiet flip animation of about 0.4s (done in CSS). Front and back are labeled.
- **Copy tone:** short, calm, and encouraging ("Nice, 4 out of 5. Ready for the next chunk?").
- **Motion:** minimal. Gentle fades between steps, a slow spinning loading ring, and nothing flashing.

## Components

### Page pattern (state + render)
All session data lives in one `state` object in `public/app.js` (see **Data Model**). Data changes only through small functions in `app.js` called *actions*, for example `goTo(screen)`, `startStudying(text)`, `saveOwnCard(card)`, `answerQuestion(i)`, and `nextChunk()`. Each action updates `state`, then calls `render()`. `render()` clears `#app` and asks the current screen's file to build the page from `state`.

Screen and component files are functions: they take `state` and `actions` and return page elements. They never change `state` directly.

Elements are built with a tiny helper, `el(tag, props, children)`, in `public/lib/dom.js`. All text from Claude or from the learner is set as text, never as raw HTML, so characters like `<` can't break the page.
Files: `public/app.js`, `public/lib/dom.js`. PRD ref: `prd.md > The Core Journey`.

### Opening Page
Shows the name "StudyMode", a one-line description, and a **Get started** button that calls `goTo("home")`.
File: `public/screens/opening.js`. Implements `prd.md > Opening Page`.

### Home Page
Shows the hero, then three or four how-to steps, then the **input area**: a PDF upload box and a "paste text instead" text box with a **Start studying** button. Errors appear here, under the input area.
File: `public/screens/home.js`. Implements `prd.md > Home Page`, `prd.md > States and Boundaries` (unusable-file error).

### PDF text reader
Takes the uploaded file and uses PDF.js, loaded from `/vendor/pdfjs/`, to pull out the text of every page, joined with paragraph breaks. If the file isn't a PDF, or the result has fewer than about 50 words (a scanned PDF), it reports an "unusable file" error.
File: `public/lib/readPdf.js`. Implements `prd.md > Home Page`, `prd.md > Non-Goals` (no reading text from images).

### Chunker
Splits text into chunks of about 600–800 words, cutting only at paragraph breaks. If a single paragraph is longer than 800 words, it's cut at a sentence end. A leftover piece under about 200 words joins the chunk before it. It's the same for PDFs and pasted text.
File: `public/lib/chunkText.js`. Implements `prd.md > Chunking`; resolves `prd.md > Open Questions > Chunk size`.

### Loading
A calm spinning ring with a short line ("Reading chunk 2…"). It shows whenever `state.screen` is `"loading"`: after Start studying, and after Next chunk.
File: `public/components/loading.js`. Implements `prd.md > Loading`.

### Study round fetcher (page side)
One function that sends `{ chunkText, chunkNumber, totalChunks }` to `/api/study-round` with `fetch`, and returns the parsed study round, or throws an error with a friendly message.
File: `public/lib/api.js`.

### Study Screen
Shows one chunk at a time and steps through `summary → flashcards → quiz → score` according to `state.step`. The progress line at the top shows the chunk number and the current step.
File: `public/screens/study.js`. Implements `prd.md > Chunking` (one chunk at a time), `prd.md > Screens and Layout`.

### Summary
Shows the 3–5 key points as bullets. Words that Claude wrapped in `**double asterisks**` become `<mark>` highlighted terms; splitting the text on `**` is all that's needed. Below the points are **Create your own flashcard** and **Go to flashcards**. There's no timer.
File: `public/components/summary.js`. Implements `prd.md > Summary`.

### Create Your Own Flashcard
A blank card with two fields, **Front** (a question or keyword) and **Back** (your note), plus **Save** and **Cancel**. Saving calls `saveOwnCard`, which adds the card to this chunk's list in `state.ownCards`. It's kept for the session only.
File: `public/components/ownCardEditor.js`. Implements `prd.md > Create Your Own Flashcard`; confirms the front/back assumption in `prd.md > Open Questions`.

### Flashcards
First asks "How many cards?" with a 1–10 picker (default 5). Then it shows that many of Claude's 10 cards, followed by the learner's own cards, which carry a small "Yours" tag. Tapping a card toggles a CSS `flipped` class directly on that card. This is the one exception to the full redraw, because a flip is only visual. **Go to quiz** moves on.
File: `public/components/flashcards.js`. Implements `prd.md > Flashcards`.

### Quiz and Score
Shows the 5 questions one at a time, each with 4 options. Picking an option locks it and shows **Correct** or **Not quite**, with the right answer marked and a one-line explanation. After question 5, it shows the chunk score (for example, 4/5) and the session score so far, then **Next chunk** (or **See results** on the last chunk).
File: `public/components/quiz.js`. Implements `prd.md > Quiz and Score`.

### Finished Screen
Shows the total score for the whole document (for example, 27/35), a calm closing line, and **Upload another PDF**, which resets `state` and goes back to the Home Page.
File: `public/screens/finished.js`. Implements `prd.md > Finished Screen`.

### Helper server
A small Express app on port 3000 that does three things:
1. Serves the `public/` folder, which is the page itself.
2. Serves PDF.js's browser files from `node_modules/pdfjs-dist/build` at `/vendor/pdfjs/`.
3. Handles `POST /api/study-round`: it reads the API key from `.env`, checks that `chunkText` is present, calls Claude (see **External Services and Dependencies**), checks the reply's shape, and returns it.

Files: `server/index.js`, `server/studyRound.js`. Serves `prd.md > Summary`, `prd.md > Flashcards`, `prd.md > Quiz and Score`.

### Switching to React later
This is possible, but not automatic: the screen and component files would be rewritten as React components. To keep that a contained job, the code is split so that most of it carries over unchanged:
- **Carries over:** the helper server, the Claude request, `readPdf.js`, `chunkText.js`, `api.js`, and `styles.css`.
- **Translates directly:** the `state` object and *actions* become React state and event handlers. Each `screens/` and `components/` file becomes one React component with the same name and job.

Rough size: a few hours of guided work once the app runs. Best done after submission, not before.

## Data Model

Everything lives in one `state` object in `public/app.js`, in the page's memory. Nothing is written to disk, the browser, or a database.

| Data | Shape | Updated by | After closing or refreshing |
|---|---|---|---|
| `screen` | `"opening" \| "home" \| "loading" \| "study" \| "finished"` | `goTo`, loading start and finish | Starts at `opening` again |
| `chunks` | `string[]`, the chunk texts | `startStudying` | Gone |
| `chunkIndex` | number, starting at 0 | `nextChunk` | Gone |
| `round` | the study round for the current chunk (below) | Each successful fetch | Gone |
| `step` | `"summary" \| "flashcards" \| "quiz" \| "score"` | Step buttons | Gone |
| `ownCards` | `{ [chunkIndex]: { front, back }[] }` | `saveOwnCard` | Gone |
| `cardCount` | number from 1 to 10 | Flashcard picker | Gone |
| `quizPos` | question number, from 0 to 4 | `answerQuestion`, next question | Gone |
| `chunkScore` | `{ correct, total: 5 }` | `answerQuestion` | Gone |
| `sessionScore` | `{ correct, total }` | Adding each finished chunk's score | Gone |
| `error` | string or null | Failed read or fetch | Gone |

**Study round** (what the helper returns for one chunk):

```json
{
  "keyPoints": ["Photosynthesis turns **light energy** into chemical energy.", "..."],
  "flashcards": [{ "front": "What is chlorophyll?", "back": "The green pigment that absorbs light." }],
  "quiz": [{
    "question": "Where does photosynthesis happen?",
    "options": ["Mitochondria", "Chloroplasts", "Nucleus", "Cell wall"],
    "correctIndex": 1,
    "explanation": "Chloroplasts contain chlorophyll, which captures light."
  }]
}
```

Rules: 3–5 `keyPoints`, exactly 10 `flashcards`, exactly 5 `quiz` items, each with 4 `options`. The helper checks the counts. If there are too many it trims them; if there are too few it treats the reply as an error.

## File Structure

```
studymode/
├── package.json          # dependencies + "start" script (node --watch --env-file=.env server/index.js)
├── .env.example          # ANTHROPIC_API_KEY= (template; the real .env stays private)
├── README.md             # what StudyMode is, setup, how to run, demo steps
├── sample/
│   └── sample-notes.pdf  # a multi-page PDF known to work, for testing and the demo
├── server/               # the helper server (Node + Express)
│   ├── index.js          # port 3000: serves public/, /vendor/pdfjs/, POST /api/study-round
│   └── studyRound.js     # builds the Claude request, Zod schema, count checks
├── public/               # the page you see (plain HTML/CSS/JS, sent to the browser as is)
│   ├── index.html        # the single page: <div id="app">, Inter font, loads app.js as a module
│   ├── styles.css        # color variables, font, layout, card flip, feedback colors
│   ├── app.js            # the state object, actions, and render()
│   ├── screens/
│   │   ├── opening.js
│   │   ├── home.js           # hero, steps, upload + paste, error message
│   │   ├── study.js          # progress line; summary → flashcards → quiz → score
│   │   └── finished.js
│   ├── components/
│   │   ├── loading.js
│   │   ├── summary.js        # key points with highlighted terms
│   │   ├── ownCardEditor.js  # blank front/back card
│   │   ├── flashcards.js     # count picker + cards that flip
│   │   └── quiz.js           # one question at a time, feedback, chunk score
│   └── lib/
│       ├── dom.js            # el() helper for building page elements safely
│       ├── readPdf.js        # PDF.js: file → text (or "unusable file" error)
│       ├── chunkText.js      # text → ~600–800-word chunks
│       └── api.js            # calls /api/study-round
└── devpost/              # Devpost learning workspace (planning docs)
```

## External Services and Dependencies

### Claude API (via the helper server)
- **Call:** `client.messages.parse(...)` from `@anthropic-ai/sdk`, made only in `server/studyRound.js`.
  - `model`: `"claude-opus-5-5"`
  - `max_tokens`: 16000
  - `output_config`: `{ effort: "low", format: zodOutputFormat(StudyRoundSchema) }`. *Structured outputs* make Claude's reply match the JSON shape in **Data Model**.
  - `system`: "You turn one chunk of a student's study material into a study round. Use only facts from this chunk. Key points: 3–5 short bullets in plain language; wrap the most important terms in **double asterisks**. Flashcards: 10, front is a question or term, back is a short answer. Quiz: 5 multiple-choice questions, 4 options each, one correct, with a one-line explanation."
  - `messages`: one user message containing `Chunk {n} of {total}:` followed by the chunk text.
  - Read `response.parsed_output`. If it's null, or `stop_reason` isn't `"end_turn"`, treat the call as failed.
- **Helper route:**
  - Request: `POST /api/study-round`, body `{ chunkText: string, chunkNumber: number, totalChunks: number }`
  - Success: `200`, with the study round JSON
  - Failure: `500` `{ error: "friendly message" }`
- **Key:** `ANTHROPIC_API_KEY` in `.env`, loaded with Node's `--env-file=.env`. The SDK reads it automatically. Getting a key needs a Claude Console account with prepaid credit; Claude Pro does not include API use.
- **Cost (rough estimate, check current pricing early in the build):** a chunk is about 1,000–1,500 words' worth of tokens in and about 2,000 out. On Opus 5.5 ($4 in / $20 out per million tokens), that's about **5¢ per chunk**, so about 50¢ for a 10-chunk document. Cost only comes from chunks actually studied.
  Pricing: https://platform.claude.com/docs/en/about-claude/pricing
- **Rate limits:** one request every few minutes is far below new-account limits.
- **Docs:** https://platform.claude.com/docs/en/build-with-claude/structured-outputs · https://platform.claude.com/docs/en/about-claude/models/overview
- **Check early in the build:** whether the schema can enforce exact array lengths. If it can't, the helper's count checks cover it.

### PDF.js
Runs entirely in the browser, with no account and no cost. `readPdf.js` imports `/vendor/pdfjs/pdf.min.mjs` and sets `GlobalWorkerOptions.workerSrc` to `/vendor/pdfjs/pdf.worker.min.mjs`. Verify those file names against the installed `pdfjs-dist` version in the first build step.

### Google Fonts (Inter)
Loaded with a `<link>` in `index.html`. If you're offline, the page falls back to the system font and still works.

## Important Failure Modes

- **Unusable file:** the file isn't a PDF, it's a scanned PDF with no text, or it can't be read → the Home Page shows "We couldn't read text from this file. Try another PDF, or paste your text below." The input stays ready. Implements `prd.md > States and Boundaries`.
- **Claude call fails** (no key, wrong key, out of credit or over the spending limit, network down, or a reply in the wrong shape) → the loading icon is replaced by "We couldn't prepare this chunk. Check your connection and try again," with **Try again**, which re-sends the same chunk. Scores so far are kept. If the key is missing, the helper also prints a clear message in the terminal.
- **Slow reply:** a round may take 10–30 seconds → the loading line says "This can take a few seconds…" and keeps spinning.

## What Was Simplified and Why

- **Plain HTML/CSS/JavaScript instead of React.** *Learner's choice, to ship fast.* There's no build step, and one command starts everything. The cost is redrawing the page by hand, which the state + render pattern keeps manageable. A React version would follow **Switching to React later**.
- **The helper also serves the page.** That means one program, one port, and no separate dev server.
- **One Claude request per chunk** that returns key points, 10 flashcards, and the quiz together. There's one loading wait per chunk, and changing the card count is instant. The fuller version would request exactly the chosen number, but that adds a wait and a cost every time the count changes.
- **Rounds are made when you reach a chunk**, not all upfront and not prepared ahead in the background. Cost stays tied to what's actually studied. The tradeoff is a short wait at each **Next chunk**.
- **Full redraw on every change** instead of updating only the parts that changed. It's simpler, and fast enough for one small screen at a time.
- **No web addresses per screen.** The browser back button won't move between screens, which is fine for one study session.
- **Memory only, nothing saved.** This was cut in `scope.md > Explicitly Cut`.
- **Runs locally.** Hosting is optional and decided in `6-ship`.

Nothing is faked. Every summary, flashcard, and quiz comes from Claude reading the learner's real chunk.

## Decisions and Open Issues

### Decided
- **Run locally; decide on hosting in `6-ship`.** *Learner's choice.*
- **Two parts: the page you see, plus a small helper server holding the API key.** *Recommended by the agent, accepted by the learner.*
- **Plain HTML/CSS/JavaScript, not React.** *Learner's choice at review*, "trying to ship as fast as possible." This replaces the earlier React + Vite choice. The agent's honest view, given when asked, was that plain JavaScript is enough for this app's size. React may be added after submission (see **Switching to React later**).
- **Claude Opus 5.5 at low effort.** *Learner's choice*, over Haiku 5.5. Tradeoff accepted: about 5¢ per chunk instead of about 0.1¢. Switching later is a one-line change in `server/studyRound.js`.
- **Chunk size about 600–800 words, split at paragraph breaks.** *Recommended; the learner agreed it's "about right."*
- **Summary as key points with highlights, no raw text.** *Learner's request.*
- **Dark blues, light background, clean simple font.** *Learner's choice.* The agent turned it into the exact colors and Inter font under **Look and Feel**.
- **Implementation details derived by the agent** (adjustable during the build): Express serving the page, the state + render pattern, the `el()` helper, PDF.js served from `node_modules`, one request per chunk with 10 cards, rounds made on reaching each chunk, `**term**` highlight markers, own-card template with Front and Back.

### Learner uncertainty discussed
- **"Is a chunk the page I have to read?"** Clarified: the chunk is only the behind-the-scenes input sent to Claude. The learner sees key points with highlights, flashcards, and a quiz.
- **"Would hosting on a free site still cost money?"** Clarified: hosting is free, but every chunk studied is a paid Claude call, and a spending limit caps it.
- **"Does Claude Pro cover the API key?"** Clarified: no. API use is billed separately through the Claude Console with prepaid credit. About $5 covers roughly 100 chunks on Opus 5.5.
- **"Can I switch to React later?"** Clarified: yes, by rewriting the screen and component files. The server and logic files carry over (see **Switching to React later**).

### Still open
- `prd.md > Open Questions > own-card template`: the front/back card is used as assumed. It can be adjusted during the build.
- **Check early in the build:** loading PDF.js as a module from `/vendor/pdfjs/`, whether the reply schema can enforce exact list lengths, and current Claude pricing.
