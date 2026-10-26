// Home Page: the input area where study material comes in.
import { el } from "../lib/dom.js";

export function homeScreen(state, actions) {
  const fileInput = el("input", {
    type: "file",
    accept: "application/pdf,.pdf",
    class: "file-input",
    id: "pdf-upload",
    onChange: (event) => actions.startFromPdf(event.target.files[0]),
  });

  const textBox = el("textarea", {
    placeholder: "Paste your notes or a few pages of text here…",
    "aria-label": "Paste your study text",
  });

  return el("main", { class: "screen" }, [
    el("h1", {}, "StudyMode"),
    el("p", { class: "soft" }, "Upload a PDF or paste your notes, then study them one short chunk at a time."),
    el("section", { class: "card" }, [
      el("h2", {}, "Upload a PDF"),
      fileInput,
      el("label", { class: "upload-box", htmlFor: "pdf-upload" }, [
        el("span", { class: "upload-title" }, "Choose a PDF"),
        el("span", { class: "soft" }, "The file stays on your computer. Only the chunks you study are sent to Claude, one at a time."),
      ]),
      state.error && el("p", { class: "error", role: "alert" }, state.error),
      el("p", { class: "divider" }, "or"),
      el("h2", {}, "Paste text instead"),
      textBox,
      el("div", { class: "actions" }, [
        el("button", { class: "button", onClick: () => actions.startStudying(textBox.value) }, "Start studying"),
      ]),
    ]),
  ]);
}
