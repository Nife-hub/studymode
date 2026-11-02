---
doc: next-features
status: draft
---

# StudyMode — Next Features (after the hackathon)

Planning notes for the first post-submission features. They come from `scope.md > Later` and `prd.md > Deferred From the POC`.
Paused on 2026-11-02 ("i'll continue later"). See **Where We Left Off**.

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
- For each chunk: every quiz question, and whether the learner got it right or wrong.
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
- An unfinished session is saved together with the document's text, so it can be resumed without uploading again.
- **When the app opens** and there's an unfinished session, the learner is asked: **continue** or **start over from the beginning**. *Learner's choice.*
- Continue picks up at the **start of the next unfinished chunk**. Partial progress inside a chunk isn't kept. *Learner's choice.*
- If a document is too big to fit in browser storage, show a friendly message; the score history is still saved.

## Still open
- Where the history screen is reached from (e.g. a button on the Home Page or the Finished Screen).
- If the learner picks "start over": is the old unfinished entry kept in history, replaced, or removed?
- If several sessions are unfinished, which one does the app ask about on open (probably the most recent)?
- Deleting history entries: needed or not?

## Where We Left Off
All core behavior for both features is decided. Next: answer the open questions above, then plan the build steps and start with Feature 1 (score history).
