// Home Page: the input area where study material comes in.
import { el } from "../lib/dom.js";

const STEPS = [
  ["Add your material.", "Upload a PDF or paste your notes below."],
  ["Read the key points.", "A short summary of one chunk, with the important terms highlighted."],
  ["Practise with flashcards.", "Choose how many you want, and add your own."],
  ["Take a quick quiz.", "Five questions, then move on to the next chunk."],
];

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
    el("section", { class: "hero" }, [
      el("h1", {}, "Study a little at a time, and actually finish."),
      el("p", { class: "soft" }, [
        "Long PDFs are tiring to read straight through. StudyMode splits yours into short chunks. ",
        "For each one you get the key points, flashcards, and a quick quiz, so you always know what to do next.",
      ]),
    ]),
    el("section", { class: "steps" }, [
      el("h2", {}, "How it works"),
      el("ol", {}, STEPS.map(([title, text]) => el("li", {}, [el("strong", {}, title), el("span", { class: "soft" }, text)]))),
    ]),
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
