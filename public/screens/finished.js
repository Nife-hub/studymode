// Finished Screen: the total score for the whole document.
import { el } from "../lib/dom.js";

export function finishedScreen(state, actions) {
  const { correct, total } = state.sessionScore;
  const chunks = state.chunks.length;

  return el("main", { class: "screen" }, [
    el("section", { class: "card score" }, [
      el("p", { class: "soft" }, "You finished the whole document"),
      el("p", { class: "big-score" }, `${correct}/${total}`),
      el("h2", {}, `${chunks} chunk${chunks === 1 ? "" : "s"}, one step at a time. Well done.`),
      el("p", { class: "soft" }, "Take a short break before your next one."),
      el("div", { class: "actions center" }, [
        el("button", { class: "button", onClick: actions.startOver }, "Upload another PDF"),
      ]),
    ]),
  ]);
}
