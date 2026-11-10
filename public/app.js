// The heart of the page: one `state` object, small actions that change it, and render().
import { chunkText } from "./lib/chunkText.js";
import { fetchStudyRound } from "./lib/api.js";
import { readPdf } from "./lib/readPdf.js";
import { setUpThemeToggle } from "./lib/theme.js";
import { createSession, recordChunk, nameFromText, nameFromFile } from "./lib/history.js";
import { openingScreen } from "./screens/opening.js";
import { homeScreen } from "./screens/home.js";
import { studyScreen } from "./screens/study.js";
import { finishedScreen } from "./screens/finished.js";
import { historyScreen } from "./screens/history.js";
import { loadingView } from "./components/loading.js";

const freshState = () => ({
  screen: "opening",
  chunks: [],
  chunkIndex: 0,
  round: null,
  step: "summary",
  ownCards: {},
  cardCount: 5,
  editingCard: false,
  quizPos: 0,
  picked: null,
  chunkScore: { correct: 0, total: 5 },
  sessionScore: { correct: 0, total: 0 },
  error: null,
  sessionId: null,
  sessionName: "",
  answers: [],
});

let state = freshState();

const screens = {
  opening: openingScreen,
  home: homeScreen,
  loading: loadingView,
  study: studyScreen,
  finished: finishedScreen,
  history: historyScreen,
};

let lastView = "";

function render() {
  const app = document.getElementById("app");
  app.replaceChildren(screens[state.screen](state, actions));
  // Jump to the top only when moving to a new screen or step, not on every small change.
  const view = `${state.screen}/${state.step}/${state.chunkIndex}`;
  if (view !== lastView) window.scrollTo(0, 0);
  lastView = view;
}

function update(changes) {
  state = { ...state, ...changes };
  render();
}

// Fetches the study round for the current chunk, showing the loading ring meanwhile.
// If it fails, the loading screen offers Try again; chunks and scores are kept.
async function loadRound() {
  update({ screen: "loading", error: null });
  try {
    const round = await fetchStudyRound(state.chunks[state.chunkIndex], state.chunkIndex + 1, state.chunks.length);
    // The session goes into history once its first round has loaded.
    const sessionId = state.sessionId ?? createSession(state.sessionName, state.chunks.length);
    update({
      sessionId,
      answers: [],
      screen: "study",
      round,
      step: "summary",
      quizPos: 0,
      picked: null,
      chunkScore: { correct: 0, total: round.quiz.length },
    });
  } catch (err) {
    update({ error: err.message });
  }
}

const actions = {
  goTo(screen) {
    update({ screen, error: null });
  },

  async startFromPdf(file) {
    update({ screen: "loading", error: null, chunks: [], chunkIndex: 0 });
    try {
      actions.startStudying(await readPdf(file), nameFromFile(file.name));
    } catch (err) {
      update({ screen: "home", error: err.message });
    }
  },

  startStudying(text, name = "") {
    const chunks = chunkText(text);
    if (!chunks.length) {
      update({ screen: "home", error: "There's no text to study yet. Paste some notes first." });
      return;
    }
    state = { ...freshState(), chunks, sessionName: name.trim() || nameFromText(text) };
    loadRound();
  },

  setStep(step) {
    update({ step, editingCard: false });
  },

  openCardEditor() {
    update({ editingCard: true });
  },

  closeCardEditor() {
    update({ editingCard: false });
  },

  saveOwnCard(card) {
    const forChunk = [...(state.ownCards[state.chunkIndex] ?? []), card];
    update({ ownCards: { ...state.ownCards, [state.chunkIndex]: forChunk }, editingCard: false });
  },

  setCardCount(cardCount) {
    update({ cardCount });
  },

  answerQuestion(i) {
    if (state.picked !== null) return;
    const right = i === state.round.quiz[state.quizPos].correctIndex;
    const { correct, total } = state.chunkScore;
    update({
      picked: i,
      answers: [...state.answers, i],
      chunkScore: { correct: correct + (right ? 1 : 0), total },
    });
  },

  // After the last question, the chunk's score is added to the session score.
  nextQuestion() {
    if (state.quizPos < state.round.quiz.length - 1) {
      update({ quizPos: state.quizPos + 1, picked: null });
      return;
    }
    const { correct, total } = state.sessionScore;
    const sessionScore = { correct: correct + state.chunkScore.correct, total: total + state.chunkScore.total };
    // Save this chunk to history: each question with the answer that was picked.
    const questions = state.round.quiz.map((q, n) => ({ ...q, picked: state.answers[n] ?? null }));
    recordChunk(state.sessionId, state.chunkIndex, questions, sessionScore);
    update({ step: "score", sessionScore });
  },

  nextChunk() {
    if (state.chunkIndex >= state.chunks.length - 1) {
      update({ screen: "finished" });
      return;
    }
    state = { ...state, chunkIndex: state.chunkIndex + 1 };
    loadRound();
  },

  retryChunk() {
    loadRound();
  },

  startOver() {
    state = { ...freshState(), screen: "home" };
    render();
  },
};

render();
setUpThemeToggle();
