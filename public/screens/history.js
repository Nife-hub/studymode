// History Screen: past study sessions, sorted the way the learner picks.
// Opening one lists its chunks; clicking a chunk shows its questions, marked right or wrong,
// and clicking a question lets the learner answer it again for revision.
import { el } from "../lib/dom.js";
import { loadHistory, loadDocument } from "../lib/history.js";
import { LETTERS } from "../components/quiz.js";

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
  const open = sessions.find((s) => s.id === state.viewingSession);
  if (open) return sessionDetail(open, actions);

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

const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const unfinishedTag = (s) =>
  !s.finished && el("span", { class: "unfinished-tag" }, `Unfinished · ${s.chunksDone} of ${s.chunkCount} chunks`);

// Continue / Start over for an unfinished session whose document is still saved.
function resumeButtons(s, actions) {
  if (s.finished) return false;
  if (!loadDocument(s.id)) return el("p", { class: "soft small resume-row" }, "Document not saved");
  return el("div", { class: "resume-row" }, [
    el("button", { class: "button small-button", onClick: () => actions.resumeSession(s.id) }, "Continue"),
    el("button", { class: "button secondary small-button", onClick: () => actions.restartSession(s.id) }, "Start over"),
  ]);
}

function historyRow(s, actions) {
  return el("li", { class: "card history-row" }, [
    el("button", { class: "history-info", onClick: () => actions.openSession(s.id) }, [
      el("strong", { class: "history-name" }, s.name),
      el("span", { class: "soft small" }, `${formatDate(s.date)} · See questions →`),
      unfinishedTag(s),
    ]),
    el("span", { class: "history-score" }, `${s.score.correct}/${s.score.total}`),
    el("button", { class: "button secondary small-button", onClick: () => actions.deleteSession(s.id, s.name) }, "Delete"),
    resumeButtons(s, actions),
  ]);
}

function sessionDetail(s, actions) {
  return el("main", { class: "screen" }, [
    el("button", { class: "button secondary back-button", onClick: actions.closeSession }, "← Back to history"),
    el("h1", { class: "history-name" }, s.name),
    el("p", { class: "soft" }, `${formatDate(s.date)} · Total score ${s.score.correct}/${s.score.total}`),
    unfinishedTag(s),
    el("p", { class: "soft hint" }, "Click a chunk to see its questions."),
    el("div", { class: "chunk-list" }, s.results.map((answers, i) => {
      const right = answers.filter((a) => a.right).length;
      return el("details", { class: "card chunk-results" }, [
        el("summary", {}, [
          el("span", { class: "chunk-title" }, `Chunk ${i + 1}`),
          el("span", { class: "chunk-score" }, `${right}/${answers.length}`),
        ]),
        el("ol", { class: "question-results" }, answers.map((a) =>
          el("li", {}, el("details", { class: a.right ? "correct" : "wrong" }, [
            el("summary", {}, [
              el("span", { class: "mark", "aria-label": a.right ? "Right" : "Wrong" }, a.right ? "✓" : "✗"),
              el("span", {}, a.question),
            ]),
            practice(a),
          ]))
        )),
      ]);
    })),
  ]);
}

// Answer a past question again. This practice isn't scored or saved, so it lives
// in the element itself rather than in the app's state.
function practice(a) {
  const box = el("div", { class: "practice" });
  if (!a.options) {
    box.append(el("p", { class: "soft small" }, "This question was saved before answers were kept, so it can't be practised again."));
    return box;
  }

  const show = (picked) => {
    const answered = picked !== null;
    const options = a.options.map((option, i) => {
      let cls = "option";
      if (answered && i === a.correctIndex) cls += " correct";
      else if (answered && i === picked) cls += " wrong";
      return el("button", { class: cls, disabled: answered, onClick: () => show(i) }, [
        el("span", { class: "option-letter" }, LETTERS[i]),
        el("span", {}, option),
      ]);
    });
    const right = picked === a.correctIndex;
    // Built with el() so the "answered && …" parts that are false are skipped, not shown as text.
    box.replaceChildren(...el("div", {}, [
      el("div", { class: "options" }, options),
      answered &&
        el("div", { class: right ? "feedback correct" : "feedback wrong", role: "status" }, [
          el("strong", {}, right ? "Correct" : "Not quite"),
          el("span", {}, ` · ${a.explanation}`),
        ]),
      answered && el("p", { class: "soft small" }, `The first time, you picked ${LETTERS[a.picked]}.`),
      answered && el("button", { class: "button secondary small-button", onClick: () => show(null) }, "Try again"),
    ]).childNodes);
  };
  show(null);
  return box;
}
