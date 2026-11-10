// Home Page: the input area where study material comes in.
import { el } from "../lib/dom.js";

const STEPS = [
  ["📄", "Drop in your material.", "Upload a PDF or paste your notes below."],
  ["✨", "Get the key points.", "A short summary of one chunk, with the big ideas highlighted."],
  ["🃏", "Flip some flashcards.", "Pick how many you want, and add your own."],
  ["✅", "Take a quick quiz.", "Five questions, then on to the next chunk."],
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
      el("h1", {}, "Turn that never-ending PDF into quick, easy wins."),
      el("p", { class: "soft" }, "Bite-sized chunks, flashcards and mini quizzes, so you actually make it to the last page."),
    ]),
    el("section", { class: "steps" }, [
      el("h2", {}, "How it works"),
      el("ol", {}, STEPS.map(([icon, title, text]) =>
          el("li", {}, [
            el("span", { class: "step-icon", "aria-hidden": "true" }, icon),
            el("strong", {}, title),
            el("span", { class: "soft" }, text),
          ])
        )),
    ]),
    el("section", { class: "card upload-card" }, [
      el("h2", {}, "Upload a PDF"),
      fileInput,
      el("label", { class: "upload-box", htmlFor: "pdf-upload" }, [
        el("span", { class: "upload-emoji", "aria-hidden": "true" }, "📥"),
        el("span", { class: "upload-title" }, "Choose a PDF"),
        el("span", { class: "soft small" }, "Click here to pick a file"),
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
