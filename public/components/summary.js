// Summary: the chunk's key points, with **marked** terms highlighted.
import { el } from "../lib/dom.js";

export function summaryView(state) {
  return el("section", { class: "card" }, [
    el("h2", {}, "Key points"),
    el("ul", { class: "key-points" }, state.round.keyPoints.map((point) => el("li", {}, highlight(point)))),
  ]);
}

// Splitting on "**" leaves highlighted terms at the odd positions.
function highlight(text) {
  return text.split("**").map((part, i) => (i % 2 === 1 ? el("mark", {}, part) : part));
}
