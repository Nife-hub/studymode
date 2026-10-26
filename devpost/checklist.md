---
doc: checklist
status: approved
---

# Build Checklist

Build mode: [not chosen yet]

## Slices

- [ ] **1. Paste text and get real key points for chunk 1**
  Becomes usable: Run `npm start`, open http://localhost:3000, paste some notes on the Home Page, press **Start studying**, see the loading ring, then see 3–5 key points for the first chunk with important terms highlighted, in the calm dark-blue style.
  Why now: This is the core of the app and its biggest risk: Claude turning one chunk into a study round. It also sets up the project (server, page, state + render pattern, colors and font), so every later slice has somewhere to land. Paste text comes before PDF because it needs nothing extra.
  PRD ref: `prd.md > The Core Journey` (steps 3–5), `prd.md > Chunking`, `prd.md > Summary`, `prd.md > Loading`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Stack`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Look and Feel`, `spec.md > Components` (Page pattern, Home Page input area, Chunker, Loading, Study round fetcher, Study Screen, Summary, Helper server), `spec.md > Data Model`, `spec.md > File Structure`, `spec.md > External Services and Dependencies > Claude API`
  Build: Create `package.json` (Express, `@anthropic-ai/sdk`, Zod, `pdfjs-dist`; `npm start` = `node --watch --env-file=.env server/index.js`), `.env.example`, and confirm `.gitignore`. Write `server/index.js` and `server/studyRound.js` (structured output, count checks). Write `public/index.html`, `styles.css`, `app.js` (state, actions, `render()`), `lib/dom.js`, `lib/chunkText.js`, `lib/api.js`, `components/loading.js`, `components/summary.js`, `screens/study.js` (summary step only for now), and `screens/home.js` (paste box only for now). The app starts on the Home Page for this slice. Check current Claude pricing and whether the schema enforces exact list lengths.
  Verify (mechanical): `npm start` runs with no errors; `node` script runs `chunkText` on a long sample and prints chunk word counts (each about 600–800, no tiny leftover); `curl` POST to `/api/study-round` with a sample chunk returns 200 with 3–5 `keyPoints`, 10 `flashcards`, 5 `quiz` items of 4 options; with no key set, the route returns the friendly 500 and the terminal prints a clear message.
  Learner check: Start the app with `npm start`, open http://localhost:3000, paste a few paragraphs of your own notes, press **Start studying**. You should see the spinning ring, then a short list of key points with some words highlighted. Say whether the points make sense and whether the look feels calm and readable.
  Commit: `Paste text and show key points for the first chunk`

- [ ] **2. Upload a PDF instead of pasting**
  Becomes usable: On the Home Page you can pick a PDF; its text is read in the browser, split into chunks, and chunk 1's key points appear. A scanned PDF or a non-PDF shows the friendly "We couldn't read text from this file…" message and the input stays ready.
  Why now: PDF upload is the main way in, and loading PDF.js without a build tool is the other risk the spec says to check early. Doing it right after slice 1 means bad news arrives while there's still room to adjust.
  PRD ref: `prd.md > Home Page`, `prd.md > States and Boundaries` (unusable file), `prd.md > Non-Goals` (no scanned PDFs)
  Spec ref: `spec.md > Components > PDF text reader`, `spec.md > Components > Home Page`, `spec.md > External Services and Dependencies > PDF.js`, `spec.md > Important Failure Modes` (unusable file)
  Build: Serve `node_modules/pdfjs-dist/build` at `/vendor/pdfjs/` (verify the actual file names), write `public/lib/readPdf.js`, add the upload box and error message to `home.js`. Create `sample/sample-notes.pdf`, a multi-page PDF known to work.
  Verify (mechanical): `curl` confirms `/vendor/pdfjs/pdf.min.mjs` and the worker file return 200 with a JavaScript content type; in the browser, uploading `sample/sample-notes.pdf` produces more than one chunk and shows chunk 1's key points; uploading a `.txt` renamed to `.pdf` shows the friendly error with no console crash.
  Learner check: Upload `sample/sample-notes.pdf` and see key points appear. Then try uploading something that isn't a PDF (an image, say) and confirm you get a clear, calm error message and can try again.
  Commit: `Read uploaded PDFs in the browser`

- [ ] **3. Flip through flashcards, including your own**
  Becomes usable: From the key points you can **Create your own flashcard** (front and back), then **Go to flashcards**, pick how many you want (1–10), and tap each card to flip it. Your own cards show up after Claude's with a "Yours" tag.
  Why now: Flashcards are the second step of every round. They need the study round from slice 1 but no new call to Claude, so this slice is low risk and makes the round feel real.
  PRD ref: `prd.md > The Core Journey` (steps 5–6), `prd.md > Create Your Own Flashcard`, `prd.md > Flashcards`
  Spec ref: `spec.md > Components > Create Your Own Flashcard`, `spec.md > Components > Flashcards`, `spec.md > Look and Feel` (flashcards, flip animation), `spec.md > Data Model` (`ownCards`, `cardCount`)
  Build: Write `components/ownCardEditor.js` and `components/flashcards.js`, add `saveOwnCard` and step actions to `app.js`, add the flashcards step to `study.js`, add card and flip styles.
  Verify (mechanical): In the browser, save one own card, choose 3, and confirm exactly 3 generated cards plus 1 "Yours" card render; clicking a card toggles its `flipped` class; changing the count sends no new request to `/api/study-round` (check the server log).
  Learner check: Make one card of your own, go to flashcards, choose 5, and tap a few cards. You should see 5 cards plus yours, and each should flip smoothly to show the answer.
  Commit: `Add flashcards with count picker and your own cards`

- [ ] **4. Take the quiz, see your score, and move to the next chunk**
  Becomes usable: The full study loop. After flashcards, answer 5 questions one at a time with **Correct** / **Not quite** feedback, see the chunk score and session score, press **Next chunk** to get chunk 2's round, and after the last chunk see the **Finished Screen** with the total score and **Upload another PDF**.
  Why now: This closes the loop that makes StudyMode different: small rounds, one after another, with a score. Once it's in, the whole core journey works end to end.
  PRD ref: `prd.md > The Core Journey` (steps 7–9), `prd.md > Quiz and Score`, `prd.md > Finished Screen`
  Spec ref: `spec.md > Components > Quiz and Score`, `spec.md > Components > Study Screen` (progress line), `spec.md > Components > Finished Screen`, `spec.md > Data Model` (`quizPos`, `chunkScore`, `sessionScore`, `chunkIndex`)
  Build: Write `components/quiz.js` and `screens/finished.js`, add `answerQuestion` and `nextChunk` actions, add the score step and the "Chunk 2 of 7 · Quiz" progress line to `study.js`, add feedback colors.
  Verify (mechanical): In the browser with `sample/sample-notes.pdf`: answer all 5 questions and confirm the chunk score matches the right answers; **Next chunk** sends one new request and shows chunk 2; the session score adds up across chunks; finishing the last chunk shows the total; **Upload another PDF** returns to an empty Home Page with scores reset.
  Learner check: Study the sample PDF all the way through: answer the quizzes (get one wrong on purpose), move through the chunks, and reach the Finished Screen. Check that the scores add up and that "Upload another PDF" starts you fresh.
  Commit: `Add quiz, scores, next chunk, and finished screen`

- [ ] **5. Opening Page, Home Page intro, and friendly failures**
  Becomes usable: The app now opens on the **Opening Page** (name, description, **Get started**), the Home Page has its hero and how-to steps above the input, a failed Claude call shows a calm message with **Try again** (scores kept), slow replies show "This can take a few seconds…", and a README explains setup.
  Why now: These finish the first impression and protect the demo, but none of them change how the study loop works, so they come after the loop is proven.
  PRD ref: `prd.md > Opening Page`, `prd.md > Home Page` (hero, steps), `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components > Opening Page`, `spec.md > Components > Home Page`, `spec.md > Important Failure Modes`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Write `screens/opening.js`, add hero and steps to `home.js`, start `state.screen` at `"opening"`, add the error + **Try again** state to the loading flow, write `README.md`.
  Verify (mechanical): Fresh load shows the Opening Page and **Get started** reaches the Home Page; with the server stopped mid-study (or the key removed), **Next chunk** shows the friendly error, **Try again** re-sends the same chunk once the server is back, and the session score is unchanged; README setup steps match `package.json`.
  Learner check: Refresh the app and walk in from the Opening Page. Read the hero and steps and say whether they explain StudyMode the way you'd want a new student to hear it.
  Commit: `Add opening page, home intro, and friendly error recovery`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 1: first real key points from Claude, plus the look and feel
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [not started]
Route and stops: [not started]
Edit outcome: [not started]
Reflection: [not started]
Activity mode: [not started]

## Revisions
