// Privacy page: what StudyMode keeps, where, and how to delete it.
import { el } from "../lib/dom.js";
import { currentUser } from "../lib/auth.js";

const SECTIONS = [
  ["What's stored in your account", [
    "Your email address and name (from your sign-up form or your Google account).",
    "Your study history: each session's name, date, score, and the quiz questions with your answers.",
    "Saved documents: the text of unfinished sessions, so you can continue them on any device. Each account gets 5 MB. A document's text is removed when you finish it, or when you click Remove saved document.",
  ]],
  ["Who can see it", [
    "Only you. Your history is locked to your account, so other people can't see it, even other StudyMode users.",
    "To make your summaries, flashcards and quizzes, the text of each chunk is sent to Claude, Anthropic's AI. It isn't stored in StudyMode beyond what's listed above.",
  ]],
  ["Not signed in?", [
    "Your history stays in this browser only. When you log in, it moves into your account, so nothing is lost.",
  ]],
  ["Deleting everything", [
    "Delete account removes your account, history and saved documents for good, on every device. You'll find it in the account menu (top right) and below.",
  ]],
];

export function privacyScreen(state, actions) {
  const person = currentUser();
  return el("main", { class: "screen privacy" }, [
    el("button", { class: "button secondary back-button", onClick: () => actions.closePrivacy() }, "← Back"),
    el("h1", {}, "Privacy"),
    el("p", { class: "soft" }, "A short, plain list of what StudyMode keeps about you."),
    ...SECTIONS.map(([title, points]) =>
      el("section", { class: "card privacy-section" }, [
        el("h2", {}, title),
        el("ul", {}, points.map((point) => el("li", {}, point))),
      ])
    ),
    person &&
      el("div", { class: "actions" }, [
        el("button", { class: "button danger", type: "button", disabled: state.authBusy, onClick: () => actions.deleteMyAccount() },
          state.authBusy ? "Deleting…" : "Delete my account"),
      ]),
    state.error && el("div", { class: "error", role: "alert" }, el("p", {}, state.error)),
  ]);
}
