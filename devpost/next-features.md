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

## Feature 3: Word Documents and Web Articles (round 3, planning)
*Started 2026-11-10. From `scope.md > Later` and `prd.md > Deferred From the POC` (other file types).*

### Home Page redesign (learner's design)
- The input area becomes a choice of **four options: PDF, Word document (.docx), Web article, Paste text.**
- Each option is a picture card, not plain text: an illustration or something fun for each, so it doesn't look generic.
- **Picking an option** reveals only what that option needs: an upload box (PDF or Word), a link box (web article), or the paste box (text).

### Web articles
- **Any public site is allowed**: news, Wikipedia, blogs, school course pages, research articles. *Learner's choice.*

- **When an article can't be read** (login, paywall, blocked, or no real text): a friendly message that suggests pasting the text instead, with a button that switches straight to the Paste text option. *Learner's choice; the button is an agent suggestion.*

### Word documents and naming
- **Only `.docx`** (Word's format since 2007). An old `.doc` gets a friendly message suggesting saving it as `.docx` or pasting the text. *Agent suggestion, accepted by the learner.*
- **History names:** a Word document is named after its file name (like a PDF); a web article after its title. *Agent suggestion, accepted by the learner.*

### History type tags (learner's request at the R3-1 check)
- Each History entry shows a small tag for where it came from: **PDF**, **Word**, **Text** or **Link**, so sessions with the same name (e.g. the same notes as a PDF and a Word file) can be told apart. Sessions saved before this change have no tag. The learner found the cards "okay"; they may be improved later.
- At the R3-2 check, the learner asked to take the cards out of the big box: they now sit in one straight row on a laptop and wrap two by two on narrow screens, with the picked input in its own panel below.

### Round 3 build steps
Build mode: fast. Each step leaves the app working and gets its own commit.

- [x] **R3-1. Picture-card picker on the Home Page, with Word documents**
  Becomes usable: The Home Page input area becomes picture cards: **PDF**, **Word document** and **Paste text**, each with its own illustration and a little hover bounce. Picking a card shows only its input (upload box or paste box) and highlights the chosen card. Word `.docx` files are read in the browser and studied like PDFs, named after the file. An old `.doc` or broken file gets the friendly "save it as .docx or paste the text" message.
  Why now: The redesign is the part of round 3 that's about how things look, so it's where your early feedback matters most. Word is the low-risk new option and fits straight into it. The web card joins in the next step.
  Build: Add `mammoth` and serve its browser file at `/vendor/mammoth/` (like PDF.js). Write `public/lib/readDocx.js`. Rebuild the input area in `home.js` as a card picker (`state.inputKind`) with inline SVG illustrations that follow `spec.md > Look and Feel` in light and dark mode. Add a `startFromDocx` action, and the styles. Create `sample/sample-notes.docx`.
  Verify: `/vendor/mammoth/mammoth.browser.min.js` returns 200 as JavaScript. In the simulated browser, each card shows only its own input. `sample/sample-notes.docx` (read in Node with the same mammoth code) gives the expected words and chunks, and the session is named after the file. A fake `.docx` and a `.doc` show the friendly message with no crash. PDF and Paste still work, and the round-2 history tests still pass.
  Learner check: Open the Home Page and click each card. Upload `sample/sample-notes.docx` and study a chunk. Try it in dark mode and on a narrow window, and say whether the cards feel fun rather than generic.
  Commit: `Add picture-card picker and Word documents`

- [x] **R3-2. Web articles from a link**
  Becomes usable: A fourth card, **Web article**, shows a link box. The helper server fetches the page, pulls out the article's main text with Readability, and StudyMode studies it like any other document, named after the article's title. If the page can't be read (login, paywall, blocked, not a web page, or too little text), a friendly message suggests pasting the text instead, with a **Paste text instead** button that switches to that card.
  Why now: It's the riskiest piece (other people's websites, and a new server route), but the picker from R3-1 gives it a place to land, and the friendly-failure path reuses the paste card.
  Build: Add `@mozilla/readability` and `linkedom`. Write `server/article.js` and a `POST /api/article` route: only `http`/`https` links; refuse addresses on the computer or local network (so a hosted StudyMode can't be used to reach private machines); a 10-second time limit; a 5 MB size limit; HTML pages only. Write `public/lib/readArticle.js`, add the web card's illustration and link box, a `startFromLink` action, and the error with **Paste text instead**. Update `spec.md` (Components, External Services, Failure Modes).
  Verify: `curl` the route with a real public article (for example a Wikipedia page) and get the title and a few hundred or more words. A login-only or empty page, a `localhost` link, a `file:` link and a link to a PDF each get the friendly error. In the simulated browser, the link flow studies chunk 1, and **Paste text instead** switches to the paste card.
  Learner check: Paste a link to a Wikipedia page, then a news or blog article you'd really study, and check that the key points match the article. Then try a page that needs a login, and check you get the friendly message and the button works.
  Commit: `Study web articles from a link`

Afterwards: your final try of round 3, an app-map update, and pushing to GitHub.

## Feature 4: Accounts and Opening StudyMode Up (round 4, planning)
*Started 2026-11-11. From `scope.md > Later` (user accounts; opening it up for other people).*

### Why
- **Other people can use StudyMode.** Friends and other students sign up, and each gets their own private history. *Learner's choice.* That means putting StudyMode online, so accounts and going public are planned together.

### Who pays for the AI
- **The learner's API key pays, with a free daily limit per account.** *Learner's choice.*
- **A paid Pro plan:** a monthly payment for "unlimited" studying. *Learner's request.* Behind the scenes it has a high fair-use cap that normal studying never reaches, so one heavy user can't run up a huge bill. *Agent suggestion, accepted by the learner.*

### Order
- **Round 4:** put StudyMode online, add sign-up and log-in, and set the free daily limit.
- **Round 5:** the Pro plan with monthly payments. *Agent suggestion, accepted by the learner.*

### Signing in
- **Continue with Google**, or **email and password** (with a "Forgot password" email). *Agent recommendation, accepted by the learner.*
- A **Log in** button in the top bar; once signed in, it shows the person's name with a **Log out** option.

### Guests and the free limit
- **Guests can study one chunk** without an account, then are asked to sign up to keep going and save their history. *Agent recommendation, accepted by the learner.*
- **Free accounts get 5 chunks a day.** *Learner's choice.*
- **When the limit is reached:** a calm message such as "You've done your 5 chunks for today, nice work! More tomorrow." Progress is saved, so they continue later. In round 5 a Pro button joins this message. *Agent recommendation, accepted by the learner.*

### History moves into the account
- History and saved documents are kept online in the account, so they follow the person to any device.
- **On first sign-in, history already saved in that browser moves into the account automatically**, so nothing is lost. *Agent recommendation, accepted by the learner.*

### Setup (agent's choice; the learner said "you decide")
- **Supabase** for sign-in (Google, email and password) and the database. Free plan to start.
- **Render** to run the existing server online at a web address. Free plan to start; it naps when nobody has visited for a while, so the first visit after that takes about 30 to 60 seconds. The paid plan (about $7 a month) removes the nap.
- The Claude API key stays on the server only, as now.

### Agent defaults (change any of these)
- **The daily limit resets at midnight in the person's own time zone.**
- **Each account gets about 5 MB for saved documents**, the same as now, so the storage bar and "Remove saved document" keep working.
- **The guest's free chunk is limited per browser and per internet address**, so it can't be repeated endlessly by refreshing.
- **A short privacy page** says what's stored (email, name, history, saved documents) and that people can delete their account and everything in it. Delete account is in the account menu.

### Round 4 build steps
Build mode: fast. Each step leaves the app working and gets its own commit.

- [x] **R4-1. Sign up and log in**
  Becomes usable: A **Log in** button opens a sign-in screen with **Continue with Google** and email and password (with "Forgot password"). Once signed in, the top bar shows the person's name and **Log out**. Nothing else changes yet.
  Learner setup (with step-by-step help): make a free Supabase project, and set up Google sign-in in Google Cloud. Keys go in `.env`, never in chat.
  Build: Serve Supabase's browser library at `/vendor/supabase/` (like PDF.js). Write `public/lib/auth.js` and `public/screens/login.js`, add the top-bar account button, and have the server check the signed-in person on each request. Update `spec.md`.
  Verify: Sign up with email, log out and back in; sign in with Google; a wrong password and an unconfirmed email show friendly messages.
  Commit: `Add sign-up and log-in`

- [ ] **R4-2. History saved to the account**
  Becomes usable: Signed-in history and saved documents live in the account, so they show up on any device. On first sign-in, the browser's existing history moves in automatically. The storage bar counts the account's 5 MB.
  Build: Supabase tables for sessions and saved documents, each locked so people only ever see their own rows. Switch `history.js` to read and write the account when signed in, and add the one-time move from the browser. Add Delete account and the privacy page.
  Verify: Study on one browser and see the session in another browser after signing in. Old browser history appears in the account once, not twice. One account can't see another's history.
  Commit: `Save history to the account`

- [ ] **R4-3. Daily limit and the guest chunk**
  Becomes usable: Free accounts get 5 chunks a day, then the friendly "More tomorrow" message. Guests can study one chunk, then are asked to sign up.
  Build: A usage table counted on the server before each Claude request (so it can't be skipped from the browser), reset at the person's local midnight. Guest count by browser and internet address.
  Verify: The 6th chunk of the day shows the message and makes no Claude request. A guest's 2nd chunk asks them to sign up. Tomorrow's count starts again from 0.
  Commit: `Add the free daily limit`

- [ ] **R4-4. Put StudyMode online**
  Becomes usable: StudyMode runs on Render at a public web address that friends can visit and sign up on.
  Learner setup (with step-by-step help): make a free Render account and connect the GitHub repository.
  Build: Settings for Render (start command, keys stored in Render, not in the code), Supabase and Google sign-in pointed at the new address.
  Verify: Open the address on a phone, sign up, study a chunk, and see the session in History on the laptop.
  Commit: `Put StudyMode online`

## Where We Left Off
Last session: 2026-11-13.
- **Rounds 2 and 3:** complete, checked by the learner, pushed.
- **Round 4 (accounts):** fast mode. **R4-1 is done and ticked.** Email sign-in and **Continue with Google** both work for real against the Supabase project `StudyMode` (checked by the learner on 2026-11-12 and 2026-11-13).
- **Google sign-in setup (done 2026-11-13):** Google Cloud project `studymode`, under the learner's own organization rather than "No organization". Google Auth Platform branding is set up (app name StudyMode). One **Web application** OAuth client has origin `http://localhost:3000` and redirect URI = Supabase's `/auth/v1/callback`. "Use this client for an AI-powered agent" is left unticked. The Client ID and secret are only in Supabase. While testing, Google may show "hasn't verified this app", which is expected.
- **For R4-4 (going online):** add the Render address as another Authorized JavaScript origin on that Google client, and as the Site URL / redirect URL in Supabase's URL Configuration.
- **Next:** R4-2, history saved to the account.
- **Remaining ideas** (`scope.md > Later`): round 5, the Pro plan with monthly payments.
- **Before starting next time:** `git pull` first. Copy `.env.example` to `.env` with the API keys on any new computer.
