// Home Page: the input area where study material comes in.
import { el } from "../lib/dom.js";

export function homeScreen(state, actions) {
  const textBox = el("textarea", {
    placeholder: "Paste your notes or a few pages of text here…",
    "aria-label": "Paste your study text",
  });

  const start = () => actions.startStudying(textBox.value);

  return el("main", { class: "screen" }, [
    el("h1", {}, "StudyMode"),
    el("p", { class: "soft" }, "Paste your notes and study them one short chunk at a time."),
    el("section", { class: "card" }, [
      el("h2", {}, "Paste text"),
      textBox,
      el("div", { class: "actions" }, [el("button", { class: "button", onClick: start }, "Start studying")]),
      state.error && el("p", { class: "error", role: "alert" }, state.error),
    ]),
  ]);
}
