// A calm spinning ring while Claude prepares a chunk.
import { el } from "../lib/dom.js";

export function loadingView(state) {
  const chunkNumber = state.chunkIndex + 1;
  return el("main", { class: "screen loading", "aria-live": "polite" }, [
    el("div", { class: "spinner" }),
    el("p", {}, `Reading chunk ${chunkNumber}…`),
    el("p", { class: "soft" }, "This can take a few seconds…"),
  ]);
}
