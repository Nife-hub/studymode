// Study Screen: one chunk at a time, with a Home button and a progress line on top.
import { el } from "../lib/dom.js";
import { summaryView } from "../components/summary.js";
import { flashcardsView } from "../components/flashcards.js";
import { quizView, scoreView } from "../components/quiz.js";

const STEP_LABELS = { summary: "Summary", flashcards: "Flashcards", quiz: "Quiz", score: "Score" };

export function studyScreen(state, actions) {
  const chunkNumber = state.chunkIndex + 1;
  const total = state.chunks.length;
  const steps = { summary: summaryView, flashcards: flashcardsView, quiz: quizView, score: scoreView };

  return el("main", { class: "screen" }, [
    el("button", { class: "button secondary back-button", onClick: actions.leaveStudy }, "← Home"),
    el("p", { class: "progress" }, `Chunk ${chunkNumber} of ${total} · ${STEP_LABELS[state.step]}`),
    el("div", { class: "progress-bar" }, el("div", { style: `width: ${(chunkNumber / total) * 100}%` })),
    state.storageFull &&
      el("p", { class: "notice", role: "status" },
        "Storage is full, so this document can't be saved for later. Remove some saved documents in History to make space."),
    steps[state.step](state, actions),
  ]);
}
