// A blank card with a Front and a Back, for writing a note in your own words.
import { el } from "../lib/dom.js";

export function ownCardEditor(state, actions) {
  const front = el("input", { type: "text", id: "own-front", placeholder: "A question or keyword" });
  const back = el("textarea", { id: "own-back", class: "short", placeholder: "Your note, in your own words" });
  const message = el("p", { class: "soft small" });

  const save = () => {
    if (!front.value.trim() || !back.value.trim()) {
      message.textContent = "Fill in both sides to save your card.";
      return;
    }
    actions.saveOwnCard({ front: front.value.trim(), back: back.value.trim() });
  };

  return el("section", { class: "card own-card-editor" }, [
    el("h2", {}, "Your own flashcard"),
    el("label", { htmlFor: "own-front" }, "Front"),
    front,
    el("label", { htmlFor: "own-back" }, "Back"),
    back,
    message,
    el("div", { class: "actions" }, [
      el("button", { class: "button", onClick: save }, "Save"),
      el("button", { class: "button secondary", onClick: actions.closeCardEditor }, "Cancel"),
    ]),
  ]);
}
