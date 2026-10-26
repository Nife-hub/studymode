// A calm spinning ring while Claude prepares a chunk, or a way to try again if it failed.
import { el } from "../lib/dom.js";

export function loadingView(state, actions) {
  const chunkNumber = state.chunkIndex + 1;

  if (state.error) {
    return el("main", { class: "screen loading" }, [
      el("p", { class: "error", role: "alert" }, state.error),
      state.sessionScore.total > 0 &&
        el("p", { class: "soft" }, `Your score so far is kept: ${state.sessionScore.correct}/${state.sessionScore.total}.`),
      el("div", { class: "actions center" }, [
        el("button", { class: "button", onClick: actions.retryChunk }, "Try again"),
        el("button", { class: "button secondary", onClick: actions.startOver }, "Back to start"),
      ]),
    ]);
  }

  return el("main", { class: "screen loading", "aria-live": "polite" }, [
    el("div", { class: "spinner" }),
    el("p", {}, state.chunks.length ? `Reading chunk ${chunkNumber}…` : "Reading your PDF…"),
    el("p", { class: "soft" }, "This can take a few seconds…"),
  ]);
}
