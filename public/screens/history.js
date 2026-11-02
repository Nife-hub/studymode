// History Screen: past study sessions, sorted the way the learner picks.
import { el } from "../lib/dom.js";
import { loadHistory } from "../lib/history.js";

const percent = (s) => (s.score.total ? s.score.correct / s.score.total : 0);

export const SORTS = {
  newest: ["Newest first", (a, b) => b.date.localeCompare(a.date)],
  oldest: ["Oldest first", (a, b) => a.date.localeCompare(b.date)],
  highest: ["Highest score", (a, b) => percent(b) - percent(a)],
  lowest: ["Lowest score", (a, b) => percent(a) - percent(b)],
  name: ["Name (A–Z)", (a, b) => a.name.localeCompare(b.name)],
};

export function historyScreen(state, actions) {
  const sessions = loadHistory().sort(SORTS[state.historySort][1]);

  const sortMenu = el(
    "select",
    { id: "history-sort", onChange: (event) => actions.setHistorySort(event.target.value) },
    Object.entries(SORTS).map(([key, [label]]) =>
      el("option", { value: key, selected: key === state.historySort }, label)
    )
  );

  return el("main", { class: "screen" }, [
    el("button", { class: "button secondary back-button", onClick: () => actions.goTo("home") }, "← Home"),
    el("h1", {}, "Your history"),
    sessions.length
      ? el("section", {}, [
          el("div", { class: "sort-row" }, [el("label", { htmlFor: "history-sort" }, "Sort by"), sortMenu]),
          el("ul", { class: "history-list" }, sessions.map((s) => historyRow(s, actions))),
        ])
      : el("p", { class: "card soft" }, "Nothing here yet. Finish a chunk's quiz and it will show up here."),
  ]);
}

function historyRow(s, actions) {
  const date = new Date(s.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  return el("li", { class: "card history-row" }, [
    el("div", { class: "history-info" }, [
      el("strong", { class: "history-name" }, s.name),
      el("span", { class: "soft small" }, date),
      !s.finished && el("span", { class: "unfinished-tag" }, `Unfinished · ${s.chunksDone} of ${s.chunkCount} chunks`),
    ]),
    el("span", { class: "history-score" }, `${s.score.correct}/${s.score.total}`),
    el("button", { class: "button secondary small-button", onClick: () => actions.deleteSession(s.id, s.name) }, "Delete"),
  ]);
}
