// Summary: the chunk's key points, with **marked** terms highlighted.
import { el } from "../lib/dom.js";
import { ownCardEditor } from "./ownCardEditor.js";

export function summaryView(state, actions) {
  const ownCount = (state.ownCards[state.chunkIndex] ?? []).length;

  return el("section", {}, [
    el("div", { class: "card" }, [
      el("h2", {}, "Key points"),
      el("ul", { class: "key-points" }, state.round.keyPoints.map((point) => el("li", {}, highlight(point)))),
    ]),
    state.editingCard && ownCardEditor(state, actions),
    ownCount > 0 && el("p", { class: "soft hint" }, `You've made ${ownCount} card${ownCount === 1 ? "" : "s"} for this chunk.`),
    el("div", { class: "actions" }, [
      !state.editingCard &&
        el("button", { class: "button secondary", onClick: actions.openCardEditor }, "Create your own flashcard"),
      el("button", { class: "button", onClick: () => actions.setStep("flashcards") }, "Go to flashcards"),
    ]),
  ]);
}

// Splitting on "**" leaves highlighted terms at the odd positions.
function highlight(text) {
  return text.split("**").map((part, i) => (i % 2 === 1 ? el("mark", {}, part) : part));
}
