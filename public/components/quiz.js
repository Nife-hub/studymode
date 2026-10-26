// Quiz: 5 questions one at a time with right/wrong feedback, then the chunk score.
import { el } from "../lib/dom.js";

const LETTERS = ["A", "B", "C", "D"];

export function quizView(state, actions) {
  const q = state.round.quiz[state.quizPos];
  const answered = state.picked !== null;
  const isLast = state.quizPos === state.round.quiz.length - 1;

  const options = q.options.map((option, i) => {
    let cls = "option";
    if (answered && i === q.correctIndex) cls += " correct";
    else if (answered && i === state.picked) cls += " wrong";
    return el("button", { class: cls, disabled: answered, onClick: () => actions.answerQuestion(i) }, [
      el("span", { class: "option-letter" }, LETTERS[i]),
      el("span", {}, option),
    ]);
  });

  const right = state.picked === q.correctIndex;
  return el("section", {}, [
    el("div", { class: "card" }, [
      el("p", { class: "soft small question-count" }, `Question ${state.quizPos + 1} of ${state.round.quiz.length}`),
      el("h2", { class: "question" }, q.question),
      el("div", { class: "options" }, options),
      answered &&
        el("div", { class: right ? "feedback correct" : "feedback wrong", role: "status" }, [
          el("strong", {}, right ? "Correct" : "Not quite"),
          el("span", {}, ` · ${q.explanation}`),
        ]),
    ]),
    answered &&
      el("div", { class: "actions" }, [
        el("button", { class: "button", onClick: actions.nextQuestion }, isLast ? "See my score" : "Next question"),
      ]),
  ]);
}

export function scoreView(state, actions) {
  const { correct, total } = state.chunkScore;
  const isLastChunk = state.chunkIndex === state.chunks.length - 1;

  return el("section", { class: "card score" }, [
    el("p", { class: "big-score" }, `${correct}/${total}`),
    el("h2", {}, encouragement(correct, total)),
    el("p", { class: "soft" }, `Session score so far: ${state.sessionScore.correct}/${state.sessionScore.total}`),
    el("div", { class: "actions center" }, [
      el("button", { class: "button", onClick: actions.nextChunk }, isLastChunk ? "See results" : "Next chunk"),
    ]),
  ]);
}

function encouragement(correct, total) {
  if (correct === total) return "All correct. Ready for the next chunk?";
  if (correct >= total - 1) return `Nice, ${correct} out of ${total}. Ready for the next chunk?`;
  if (correct >= Math.ceil(total / 2)) return `Good work, ${correct} out of ${total}. Keep going.`;
  return `${correct} out of ${total}. That's what practice is for. Let's keep going.`;
}
