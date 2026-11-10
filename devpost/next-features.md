---
doc: next-features
status: draft
---

# StudyMode — Next Features (after the hackathon)

Planning notes for the first post-submission features. They come from `scope.md > Later` and `prd.md > Deferred From the POC`.
See **Where We Left Off**.

## Tech decision
**Stay with plain JavaScript; don't switch to React yet.** The app already works with one `state` object and `render()`, and these features fit that pattern. *Recommended by the agent, accepted by the learner.* Revisit React if the code gets hard to manage, or as a separate learning project.

Saved data lives in the browser's **localStorage**, with no accounts and no server changes. Limit: about 5 MB per site.

## Build order
1. **Score history.** Save each session and add a history screen.
2. **Resume where you left off.** Save the document text and progress, and ask on return.

## Feature 1: Score History

### What's saved per session
- Session name (see Naming).
- Date.
- Total score.
- For each chunk: every quiz question with its options, the right answer, the explanation, what the learner picked, and whether it was right.
- Finished or unfinished, and how many chunks are done.

### History list
- A list of past sessions. Each row shows the **document name, date, and total score**.
- Unfinished sessions are **marked unfinished** and show the chunks done (e.g. "Unfinished · 2 of 5 chunks").

### Session detail
- Opening a session shows **every question, marked right or wrong, grouped under its chunk.** *Learner's choice.*

### Naming
- PDF: the file's name.
- Pasted text: a new, optional **name box** next to the paste area. If it's left empty, the name is the **first few words of the text**. *Learner's choice.*

## Feature 2: Resume Where You Left Off
- Every unfinished session is saved together with the document's text, so it can be resumed without uploading again.
- **Continue** and **Start over** buttons sit on each unfinished entry in the **History screen**, so the learner picks which document to go back to. The Opening Page stays as it is, with only **Get started**. *Learner's choice.*
- Continue picks up at the **start of the next unfinished chunk**. Partial progress inside a chunk isn't kept. *Learner's choice.*
- Start over begins the same document from chunk 1 as a new session. The old entry stays in history, still marked unfinished, and its saved text moves to the new session so it isn't stored twice.
- When a session is finished, its saved text is removed to free up space. Its score and questions stay in history.

## Storage
- Browsers give each site about **5 MB** for this kind of storage. Only the saved document text takes up real space; scores and questions are tiny.
- The History screen shows a **storage bar**, e.g. "Saved documents: 1.8 MB of about 5 MB". The limit is approximate because browsers don't report it exactly.
- Each unfinished entry shows how much space its document takes, and has a **Remove saved document** button. That frees the space but keeps the score in history; the session can no longer be continued.
- **When storage is full**, the study session keeps going and its score is still saved. A calm message says: "Storage is full, so this document can't be saved for later. Remove some saved documents in History to make space." After space is freed, the document is saved again the next time a chunk ends.
- For scale: the 42,000-word test PDF from the final review is roughly 0.5 MB, so about 10 large documents fit.

## Decided details
*Suggested by the agent, accepted by the learner on 2026-11-02.*
- **Where history is opened from:** a **History** button on both the Home Page and the Finished Screen.
- **Deleting entries:** yes, each entry has a **Delete** button, which removes the entry and its saved document.
- **Sorting history:** a **Sort by** menu with Newest first (the default), Oldest first, Highest score, Lowest score, and Name (A–Z). Scores are compared as percentages, so documents of different lengths compare fairly. The choice is remembered in this browser. *Learner's request.*

## Build Steps
Each step leaves the app working and gets its own commit.

- [x] **1. Save each session to history**
  Becomes usable: Every finished chunk is saved in the browser. Nothing new is shown yet, but the saved data can be seen in the browser's developer tools (Application > Local Storage).
  Build: Write `public/lib/history.js` to load, save, and delete sessions in localStorage, wrapped in try/catch like `theme.js`. Add an optional **name box** to the paste area in `home.js`. Add `sessionId`, `name`, and `results` (per chunk: each question and whether it was right) to `state`. Record each answer in `answerQuestion`, and save the session when a chunk's quiz ends and when the document is finished.
  Verify: Study two chunks of `sample/sample-notes.pdf` and check that one entry appears with the file name, date, score, and "2 of N chunks", marked unfinished. Finish the document and check it becomes finished. Paste text with no name and check that the name is the first few words.
  Commit: `Save study sessions to browser history`

- [x] **2. History screen with delete, and a Home button while studying**
  Becomes usable: A **History** button on the Home Page and the Finished Screen opens a list of past sessions (name, date, total score, or "Unfinished · 2 of 5 chunks"), each with **Delete** (asks first). A **Sort by** menu above the list orders it by Newest first, Oldest first, Highest score, Lowest score, or Name (A–Z). An empty history shows a friendly line. The Study Screen gets a **← Home** button so the learner can stop in the middle; it asks first, and finished chunks stay in history. *Learner's request, found while testing Step 1.*
  Build: Write `public/screens/history.js`, register it in `app.js`, add the buttons, a `deleteSession` action, a `leaveStudy` action for the Home button, and a `setHistorySort` action that remembers the choice in localStorage (wrapped in try/catch like `theme.js`). Add list styles.
  Verify: The list matches what's in localStorage. Each sort option puts the entries in the expected order, and the chosen sort is still selected after a reload. Delete removes only that entry, and the deletion is still there after a reload.
  Commit: `Add history screen`

- [x] **3. Session detail**
  Becomes usable: Clicking an entry's name opens a list of its chunks, each with its score. Clicking a chunk opens it to show its questions, each marked right or wrong, so long documents (100+ chunks) aren't overwhelming. Clicking a question opens it so the learner can answer it again for revision: the right answer and explanation show after picking, with the first answer noted and a **Try again** button. Practice isn't scored or saved. *Learner's requests.* A **Back to history** button returns to the list.
  Build: Add the detail view to `history.js` (a `viewingSession` value in `state`), reusing the quiz's right/wrong colors.
  Verify: A session with one wrong answer on purpose shows exactly that question as wrong, under the right chunk.
  Commit: `Show each session's questions in history`

- [x] **4. Resume from history**
  Becomes usable: Unfinished entries in History get **Continue** and **Start over** buttons. **Continue** opens the start of its next unfinished chunk with the score so far. **Start over** begins the same document from chunk 1 as a new session.
  Build: Save the chunks' text with every unfinished session in a separate localStorage key per session (so the history list loads fast), and remove it when the session is finished. Add `resumeSession` and `restartSession` actions, and wire up the buttons in `history.js`. An entry without saved text shows "Document not saved" instead of the buttons.
  Verify: Stop document A after chunk 2 and document B after chunk 1. Reload, open History, and Continue A: chunk 3 loads with A's score kept. Continue B: chunk 2 loads. Start over on A: chunk 1 loads, and the old A entry stays unfinished without saved text. Finish a session and check its saved text is gone.
  Commit: `Resume unfinished sessions from history`

- [x] **5. Storage bar and full-storage handling**
  Becomes usable: The History screen shows how much of the roughly 5 MB is used, each unfinished entry shows its document size, and **Remove saved document** frees space while keeping the score. When storage is full, studying carries on and the calm "Storage is full" message appears.
  Build: Add a size count to `history.js` (characters in the saved keys × 2 bytes, which is how browsers store them). Add the storage bar, sizes, and a `removeSavedDocument` action. Catch the browser's "quota exceeded" error when saving text, save the session without it, and show the message on the Study Screen.
  Verify: The bar goes up after saving a document and down after removing one. Fill storage with a few very large pasted texts until the message appears; studying should continue, the score should still be saved, and after removing a document the next chunk saves the text again.
  Commit: `Show storage use and handle full storage`

## Where We Left Off
Paused on 2026-11-02 ("ill continue later").
- Steps 1 and 2 are done and checked by the learner.
- Step 3 is built and committed: chunks open one at a time, and questions can be answered again for revision. **Still to do:** the learner's check of Step 3 (open a chunk, practise a wrong question, try it in dark mode). Sessions saved before this change only have the question text, so their questions can't be practised.
- Next: after that check, mark Step 3 done and start Step 4 (Continue and Start over from History).

Update on 2026-11-10: a session on another computer copy, unaware of the work above, re-planned and rebuilt Step 1. The learner chose to keep this version, so that rebuild was reverted and these decisions stand (resume from History; Start over makes a new session). Fixed a Step 3 bug where "false" showed as text under a practised question. `.env` is now read by `server/loadEnv.js`. The learner checked Step 3 ("it works"). Step 4 is built and verified in a simulated browser; Start over keeps the old entry's text until the new session's first chunk is saved, so it's never lost in between. The learner checked Step 4 ("it works"). Step 5 is built and verified in a simulated browser with a small storage limit (bar up and down, full-storage note, score kept, text saved again once space is freed). The learner checked Step 5 and tried all of round 2 ("it works"). `devpost/app-map.html` now covers history and resume. Round 2 is complete and pushed to GitHub.
