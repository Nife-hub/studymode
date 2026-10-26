// Turns one chunk of study material into a study round: key points, flashcards, quiz.
// This is the only file that talks to Claude.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

// The shape we ask Claude to reply in. Structured outputs can't force exact
// list lengths, so the counts are checked in makeStudyRound below.
const StudyRoundSchema = z.object({
  keyPoints: z.array(z.string()),
  flashcards: z.array(z.object({ front: z.string(), back: z.string() })),
  quiz: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctIndex: z.number().int(),
      explanation: z.string(),
    })
  ),
});

const SYSTEM_PROMPT =
  "You turn one chunk of a student's study material into a study round. Use only facts from this chunk. " +
  "Key points: 3–5 short bullets in plain language; wrap the most important terms in **double asterisks**. " +
  "Flashcards: 10, front is a question or term, back is a short answer. " +
  "Quiz: 5 multiple-choice questions, 4 options each, one correct, with a one-line explanation.";

const client = new Anthropic();

export async function makeStudyRound({ chunkText, chunkNumber, totalChunks }) {
  const response = await client.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    output_config: { effort: "low", format: zodOutputFormat(StudyRoundSchema) },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Chunk ${chunkNumber} of ${totalChunks}:\n\n${chunkText}` }],
  });

  if (response.stop_reason !== "end_turn" || !response.parsed_output) {
    throw new Error(`Claude reply unusable (stop_reason: ${response.stop_reason})`);
  }
  return checkCounts(response.parsed_output);
}

// Too many items are trimmed; too few means the reply can't be used.
function checkCounts(round) {
  const quiz = round.quiz
    .filter((q) => q.options.length >= 4 && q.correctIndex >= 0 && q.correctIndex < 4)
    .map((q) => ({ ...q, options: q.options.slice(0, 4) }));

  if (round.keyPoints.length < 3 || round.flashcards.length < 10 || quiz.length < 5) {
    throw new Error(
      `Claude reply had too few items (keyPoints ${round.keyPoints.length}, ` +
        `flashcards ${round.flashcards.length}, usable quiz ${quiz.length})`
    );
  }

  return {
    keyPoints: round.keyPoints.slice(0, 5),
    flashcards: round.flashcards.slice(0, 10),
    quiz: quiz.slice(0, 5),
  };
}
