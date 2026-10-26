---
doc: prd
status: approved
---

# StudyMode — Product Requirements

StudyMode turns a long PDF (or pasted notes) into short study rounds, one chunk at a time: summary, then flashcards, then a quiz. It's for students who lose focus reading long material, starting with the learner.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Develops `scope.md > The Core Loop` and `scope.md > What "Working" Looks Like`.

1. The user opens StudyMode and sees the **Opening Page**: the name "StudyMode", a short description, and a **Get started** button.
2. They move on to the **Home Page**: a hero section introducing the app, then the steps for using it, then the input area.
3. They either **upload a PDF** or **paste text** into the input area.
4. A **loading indicator** shows while Claude reads the material and prepares the first chunk.
5. **Study Screen, chunk 1:** they read a short **summary** of the chunk.
   From the summary they can also **create their own flashcard**: a button opens a blank card, they type their note in their own words, and save it.
6. They move on to the **flashcards**, choose **how many** they want for this chunk (up to 10), and tap each card to flip it. Their own cards appear alongside the generated ones.
7. They move on to the **quiz**: 5 multiple-choice questions. After each answer they see whether it was correct or wrong.
8. They see their score for that chunk, then go to the **next chunk**, and steps 5–7 repeat.
9. After the last chunk's quiz, the **Finished Screen** shows their **total score** and an option to **upload another PDF**.

Success: a long document has been worked through in small, manageable rounds, with a score to show for it.

## Screens and Layout

- **Opening Page**: app name, a short description, and a **Get started** button that leads to the Home Page.
- **Home Page**, top to bottom:
  1. Hero section: introductory description of StudyMode.
  2. How-to-use steps.
  3. Input area: PDF upload, plus a paste-text option for users who don't have a PDF of their notes.
- **Loading state**: a loading icon so the user knows work is happening in the background.
- **Study Screen** (one chunk at a time): shows **Summary → Flashcards → Quiz** one after another, not all at once. There's no timer; the user reads at their own pace.
- **Finished Screen**: total score and a way to start again with another PDF.

## Look and Feel
- **Mood:** calm and relaxing. Students facing a large amount of content shouldn't feel overwhelmed.
- **Colors:** a cool background with cool tones, chosen for maximum readability and less eye strain.
- **Feel:** uncluttered, with one thing at a time on screen, which matches the one-chunk-at-a-time idea.
- **Palette and type** (decided in `4-spec`): dark blues on a light background, with a clean, simple font.
- No specific reference apps were given.

## Features and Behavior

### Opening Page
- [ ] Shows the name "StudyMode" and a short description.
- [ ] A **Get started** button takes the user to the Home Page.

### Home Page
- [ ] Shows a hero section with an introduction to StudyMode.
- [ ] Shows the steps for how to use the app.
- [ ] Below the steps, the user can upload a PDF.
- [ ] Below the steps, the user can paste text as an alternative to uploading.

### Loading
- [ ] While Claude is processing the material, a loading icon is visible.
- [ ] The loading icon goes away when the content is ready.

### Chunking
Develops `scope.md > The Unique Kernel`.
- [ ] The material is split into multiple chunks, so a multi-page PDF produces more than one round.
- [ ] Only one chunk is studied at a time.

### Summary
- [ ] Each chunk opens with a short summary of that chunk only.
- [ ] There is no time limit; the user moves on when they're ready.
- [ ] The user can move on to the flashcards.

### Create Your Own Flashcard
Writing a note in your own words helps it stick (learner's reason).
- [ ] On the summary, a button opens a blank flashcard template.
- [ ] The user types their own note into it and saves it.
- [ ] The saved card appears with that chunk's generated flashcards and flips like the others.
- [ ] Own cards last for the current session only (nothing is saved after closing).

### Flashcards
- [ ] For each chunk, the user chooses how many generated flashcards they want, up to a maximum of 10.
- [ ] That many flashcards are generated, based on that chunk.
- [ ] Tapping a card flips it to show the other side.
- [ ] The user can move on to the quiz.

### Quiz and Score
- [ ] Each chunk has a quiz of 5 multiple-choice questions about that chunk.
- [ ] After answering a question, the user sees whether it was correct or wrong.
- [ ] After the 5th question, the user sees their score for that chunk (e.g. 4/5).
- [ ] A running score for the current session is kept across chunks.
- [ ] The user can move on to the next chunk.

### Finished Screen
- [ ] After the last chunk's quiz, the total score for the whole document is shown.
- [ ] There is an option to upload another PDF, which returns the user to the input.

## States and Boundaries
- **First use**: the Opening Page, then the Home Page with the steps explaining what to do.
- **Loading**: a loading icon is shown while content is being prepared.
- **Error, unusable file** (not a PDF, or a scanned PDF with no readable text): an error message explains the problem, and the user can upload another file or paste text instead.
- **End of document**: the Finished Screen with the total score.
- **Persistence**: nothing is saved. Closing the app ends the session, including the score. (Accounts and saving were cut in `scope.md > Explicitly Cut`.)

## Product Decisions
- **Name: StudyMode.**
- **Opening Page before the Home Page.** The learner wants the name and description introduced first.
- **Steps on the Home Page.** New users see how it works before they start.
- **Upload on the Home Page, below the steps.** There's no separate upload screen.
- **Paste-text option.** For users who don't have a PDF version of their notes. It also gives the demo a fallback.
- **Summary → flashcards → quiz one after another.** This keeps the screen focused and supports the "not overwhelmed" goal.
- **Tap to flip flashcards.**
- **User chooses the number of flashcards per chunk, max 10.** This gives them control over how much to review.
- **Create-your-own flashcard from the summary.** Writing in your own words sticks better in memory.
- **No time limit on reading.** Users go at their own pace.
- **"Get started" button** on the Opening Page.
- **5 multiple-choice questions per chunk, with correct/wrong shown after each answer.**
- **Loading icon** so the user knows something is happening.
- **Finished Screen shows the total score plus "upload another PDF."**
- **Calm, cool, readable visual style** to reduce stress and eye strain.

## What We're Building
Opening Page → Home Page (hero, steps, PDF upload, paste text) → loading → for each chunk: summary (no timer, plus a button to create your own flashcard), the user's chosen number of flashcards (max 10, tap to flip, own cards included), 5-question multiple-choice quiz with correct/wrong feedback and a chunk score → next chunk → Finished Screen with total score and "upload another PDF." Plus a friendly error for unusable files.

## Deferred From the POC
- **Score history over time.** This needs saving, which is out for now.
- **Accounts and saved progress.** Cut in scope, since they aren't needed to prove the chunk-by-chunk loop.
- **Other file types** (Word, web articles). Paste-text covers the gap for now.

## Possible Later Enhancements
- Opening StudyMode up publicly for other students.
- Resuming a document where you left off.

## Non-Goals
- **Not a whole-document summarizer.** It always works one chunk at a time; that's the point.
- **Not the content idea generator.** That idea was cut in scope.
- **No reading text out of images (scanned PDFs).** It shows an error and suggests pasting text instead.

## Open Questions
- **Chunk size.** "Short" is the guide, with no reading timer. The exact amount of text per chunk is decided in `4-spec`.
- **Assumption: own-card template.** We'll assume a blank card with a front (e.g. a question or keyword) and a back (the note), so it flips like the others. Can be adjusted during the build.
