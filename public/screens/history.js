// History: every past session, newest first, with its name, date and score.
import { el } from "../lib/dom.js";
import { loadHistory } from "../lib/history.js";

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function sessionRow(session) {
  const status = session.finished
    ? "Finished"
    : `Unfinished · ${session.chunksDone} of ${session.chunkCount} chunk${session.chunkCount === 1 ? "" : "s"}`;

  return el("li", { class: session.finished ? "history-row" : "history-row unfinished" }, [
    el("div", { class: "history-main" }, [
      el("strong", { class: "history-name" }, session.name),
      el("span", { class: "soft small" }, `${formatDate(session.date)} · ${status}`),
    ]),
    el("span", { class: "history-score" }, `${session.correct}/${session.total}`),
  ]);
}

export function historyScreen(state, actions) {
  const sessions = loadHistory();

  return el("main", { class: "screen" }, [
    el("h1", {}, "Your history"),
    el("p", { class: "soft" }, "Every session you've studied in this browser."),
    sessions.length
      ? el("ul", { class: "history-list" }, sessions.map(sessionRow))
      : el("section", { class: "card center-text" }, [
          el("p", {}, "Nothing here yet."),
          el("p", { class: "soft" }, "Finish a chunk and your score will show up here."),
        ]),
    el("div", { class: "actions" }, [
      el("button", { class: "button secondary", onClick: actions.startOver }, "Back to start"),
    ]),
  ]);
}
