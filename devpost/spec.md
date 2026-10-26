---
doc: spec
status: draft
---

# StudyMode — Technical Spec

> **In progress.** This is a partial draft saved partway through the `4-spec` interview. See **Where We Left Off** at the bottom for exactly where to pick up. Sections marked *TBD* get filled in after the remaining questions.

## How This Works, In Plain Language
*Draft, to be finished after the interview.*

StudyMode has two parts that run on your laptop:

1. **The page you see** (the front of the app). It's built with **React**, a toolkit for building web pages out of reusable pieces, and runs with **Vite**, which starts the app and reloads it whenever the code changes. It shows the Opening Page, Home Page, Study Screen, and Finished Screen. It also reads the text out of your PDF right in the browser, using a free tool called **PDF.js**.
2. **A small helper program** (a "server") that holds your secret Claude API key. When the page needs a summary, flashcards, or a quiz, it asks the helper, and the helper asks Claude. This keeps the key hidden, and it's the same setup we'd reuse if StudyMode is hosted later.

Your PDF's text is cut into **chunks** of about 600–800 words (one to two pages). A chunk is never shown to you directly. It's what gets handed to Claude behind the scenes, and Claude turns it into key points with highlights, flashcards, and a quiz.

## Stack
*Partially decided.*

- **React + Vite** for the page you see. *Learner's choice.* React doesn't make the app better for users at this size. The learner chose it because learning React is a personal goal. Accepted tradeoff: a build step, more setup, and harder error messages than plain HTML/CSS/JavaScript. Everything else stays simple to make room for it.
  Docs: https://react.dev · https://vite.dev
- **PDF.js** to read text out of PDFs in the browser. *Recommended, accepted as part of the two-part setup.* Docs: https://mozilla.github.io/pdf.js/
- **Small helper server** (Node.js) that holds the API key and calls Claude. *Recommended and accepted.* Exact library: TBD in the full draft.
- **Claude API** for the summaries, flashcards, and quizzes. Model choice: TBD (balance cost, speed, and quality). Check current pricing early in the build.

## Where It Runs and How Someone Tries It
- **Runs locally** on the learner's laptop and is opened in a browser. *Learner's choice:* "local first, decide on hosting later."
- Submission needs a **short demo video** (recorded from the local app) and a **public GitHub repository**.
- **Hosting is optional and deferred to `6-ship`.** Netlify or Vercel would be free to host. The real cost is Claude usage, because every PDF anyone studies is billed to the learner's Anthropic account. If hosted, set a spending limit in the Anthropic account. The helper server already keeps the key secret, so it can be adapted to the host's server functions.
- Exact start command and what to open: TBD in the full draft.

## Look and Feel
*In progress.* Carried forward from `prd.md > Look and Feel`: calm and relaxing; a cool background with cool tones for readability and less eye strain; uncluttered, one thing on screen at a time.
Specific palette, light/dark background, and font character: **still to decide** (this is the question we stopped on).

## Components
*TBD.* Will cover the Opening Page, Home Page (input), Loading, Chunking, Summary, Create Your Own Flashcard, Flashcards, Quiz and Score, Finished Screen, and the helper server.

### Summary (decided so far)
Implements `prd.md > Summary`.
Each chunk's summary is shown as **3–5 key-point bullets**, with **important terms highlighted** (bold or a soft highlight color). The original chunk text is not shown. *Learner's request:* "i dont want the chunk to just be a page taken out of the pdf, i want it to be summarized into key points and highlights."

## Decisions and Open Issues

### Decided
- **Run locally; hosting decided later in `6-ship`.** *Learner's choice.*
- **Two parts: the page you see, plus a small helper server holding the API key.** *Recommended by the agent, accepted by the learner.*
- **React + Vite instead of plain HTML/CSS/JavaScript.** *Learner's choice*, made to learn React. Tradeoff accepted (see Stack).
- **Chunk size about 600–800 words (one to two pages), split at paragraph breaks.** *Recommended; learner agreed it's "about right."* Resolves `prd.md > Open Questions > Chunk size`.
- **Summary format: key points plus highlights, with no raw text.** *Learner's request.*

### Learner uncertainty discussed
- **"Is a chunk the page I have to read?"** The learner didn't want chunks to be raw pages copied out of the PDF. Clarified: the chunk is only the behind-the-scenes input sent to Claude. What the learner sees is key points and highlights, plus flashcards and a quiz built from the same chunk.
- **"Would hosting on a free site still cost money?"** Clarified: hosting is free; the cost is Claude usage per document, which a spending limit can cap.

### Still open
- Visual specifics: palette, light or dark background, font character.
- Claude model choice, and the exact requests and responses for the helper server.
- How flashcards are generated for the user's chosen count (for example, generate up to 10 in one request and show the number chosen).
- `prd.md > Open Questions > own-card template`: front/back blank card, still assumed.
- Core journey trace, file structure, data shape, failure modes, simplifications: to be written in the full draft.

## Where We Left Off
Interview paused by the learner on 2026-10-26 ("save the progress, I'll continue later from this point").

**Next question to resume with (design):** "Your PRD says calm, cool tones, easy on the eyes, uncluttered. Do you have a picture of what 'cool and calm' looks like to you? For example, soft blues or sea greens, a light or dark background, or a rounded friendly font versus a clean simple one. Rough words are enough."

After that answer, the readiness criteria should be met: write the full draft, create `devpost/spec.html` for the learner's HTML review, then do the review.
