// Study Screen: one chunk at a time, with a progress line on top.
import { el } from "../lib/dom.js";
import { summaryView } from "../components/summary.js";

const STEP_LABELS = { summary: "Summary", flashcards: "Flashcards", quiz: "Quiz", score: "Score" };

export function studyScreen(state, actions) {
  const chunkNumber = state.chunkIndex + 1;
  const total = state.chunks.length;
  const steps = { summary: summaryView };

  return el("main", { class: "screen" }, [
    el("p", { class: "progress" }, `Chunk ${chunkNumber} of ${total} · ${STEP_LABELS[state.step]}`),
    el("div", { class: "progress-bar" }, el("div", { style: `width: ${(chunkNumber / total) * 100}%` })),
    steps[state.step](state, actions),
  ]);
}
