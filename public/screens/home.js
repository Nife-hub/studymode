// Home Page: the input area where study material comes in.
import { el } from "../lib/dom.js";
import { inputCards } from "../components/inputCards.js";

const STEPS = [
  ["📄", "Drop in your material.", "A PDF, a Word document, a web article, or your own notes."],
  ["✨", "Get the key points.", "A short summary of one chunk, with the big ideas highlighted."],
  ["🃏", "Flip some flashcards.", "Pick how many you want, and add your own."],
  ["✅", "Take a quick quiz.", "Five questions, then on to the next chunk."],
];

// An upload box for one kind of file (PDF or Word).
function uploadBox(id, accept, title, onPick) {
  return [
    el("input", { type: "file", accept, class: "file-input", id, onChange: (event) => onPick(event.target.files[0]) }),
    el("label", { class: "upload-box", htmlFor: id }, [
      el("span", { class: "upload-emoji", "aria-hidden": "true" }, "📥"),
      el("span", { class: "upload-title" }, title),
      el("span", { class: "soft small" }, "Click here to pick a file"),
    ]),
  ];
}

function pasteArea(actions) {
  const nameBox = el("input", {
    type: "text",
    id: "paste-name",
    class: "name-box",
    placeholder: "e.g. Biology chapter 3. Leave empty to use the first few words.",
  });
  const textBox = el("textarea", {
    placeholder: "Paste your notes or a few pages of text here…",
    "aria-label": "Paste your study text",
  });
  return [
    el("label", { htmlFor: "paste-name" }, "Name (optional)"),
    nameBox,
    textBox,
    el("div", { class: "actions" }, [
      el("button", { class: "button", onClick: () => actions.startStudying(textBox.value, nameBox.value) }, "Start studying"),
    ]),
  ];
}

// A link box. Enter or the button starts reading the article.
function linkArea(actions) {
  const linkBox = el("input", {
    type: "url",
    id: "article-link",
    class: "link-box",
    placeholder: "https://…",
    autocomplete: "off",
  });
  return el("form", {
    class: "link-form",
    onSubmit: (event) => {
      event.preventDefault();
      actions.startFromLink(linkBox.value);
    },
  }, [
    el("label", { htmlFor: "article-link" }, "Link to the article"),
    linkBox,
    el("p", { class: "soft small" }, "Works with most public pages: Wikipedia, news, blogs, course pages. Pages that need a login or a subscription can't be read."),
    el("div", { class: "actions" }, [el("button", { class: "button", type: "submit" }, "Read article")]),
  ]);
}

// Only the picked card's input is shown.
function pickedInput(state, actions) {
  switch (state.inputKind) {
    case "pdf":
      return uploadBox("pdf-upload", "application/pdf,.pdf", "Choose a PDF", actions.startFromPdf);
    case "docx":
      return uploadBox(
        "docx-upload",
        ".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Choose a Word document",
        actions.startFromDocx
      );
    case "web":
      return linkArea(actions);
    case "paste":
      return pasteArea(actions);
    default:
      return el("p", { class: "soft pick-hint" }, "Pick one above to get started.");
  }
}

export function homeScreen(state, actions) {
  return el("main", { class: "screen" }, [
    el("section", { class: "hero" }, [
      el("h1", {}, "Turn that never-ending PDF into quick, easy wins."),
      el("p", { class: "soft" }, "Bite-sized chunks, flashcards and mini quizzes, so you actually make it to the last page."),
      el("button", { class: "button secondary", onClick: () => actions.goTo("history") }, "📊 Your history"),
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
      el("h2", {}, "What are you studying from?"),
      inputCards(state, actions),
      el("div", { class: "picked-input" }, pickedInput(state, actions)),
      state.error &&
        el("div", { class: "error", role: "alert" }, [
          el("p", {}, state.error),
          state.offerPaste &&
            el("button", { class: "button secondary small-button", onClick: () => actions.pickInput("paste") }, "Paste text instead"),
        ]),
    ]),
  ]);
}
