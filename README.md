# StudyMode

Upload a long PDF (or paste your notes) and study it one short chunk at a time: **key points → flashcards → quiz**, then on to the next chunk. Built for anyone who loses focus reading long material straight through.

## What it does

- Reads your PDF's text in the browser and splits it into chunks of about 600–800 words.
- For each chunk, Claude writes 3–5 key points (important terms highlighted), 10 flashcards, and a 5-question quiz.
- You choose how many flashcards to review (1–10), tap to flip them, and can add your own.
- Each quiz shows right/wrong after every answer, then your chunk score and a running session score.
- After the last chunk you see your total score.

Nothing is saved: closing the tab ends the session.

## What you need

- [Node.js](https://nodejs.org) 24 or newer
- A [Claude Console](https://platform.claude.com) account with API credit and an API key. A Claude Pro subscription does not include API use. Setting a monthly spending limit is a good idea.

## Setup (once)

```bash
npm install
cp .env.example .env
```

Open `.env` and paste your key after `ANTHROPIC_API_KEY=`. `.env` is listed in `.gitignore`, so the key never goes to GitHub.

## Run it

```bash
npm start
```

Then open **http://localhost:3000**. A sample PDF that's known to work is in `sample/sample-notes.pdf`.

## Cost

StudyMode uses Claude Opus 5.5 at low effort. Each chunk costs roughly 5¢, and you only pay for chunks you actually study.

## How it's built

- `public/`: the page, in plain HTML, CSS and JavaScript modules with no build step. All session data lives in one `state` object in `public/app.js`.
- `server/`: a small Express server that serves the page and PDF.js, and holds the API key. `POST /api/study-round` sends one chunk to Claude and returns key points, flashcards and a quiz.
- PDF text is read with [PDF.js](https://mozilla.github.io/pdf.js/); the PDF itself never leaves your computer, only the text of the chunks you study.
