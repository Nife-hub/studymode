// The heart of the page: one `state` object, small actions that change it, and render().
import { chunkText } from "./lib/chunkText.js";
import { fetchStudyRound } from "./lib/api.js";
import { readPdf } from "./lib/readPdf.js";
import { readDocx } from "./lib/readDocx.js";
import { readArticle } from "./lib/readArticle.js";
import { setUpThemeToggle } from "./lib/theme.js";
import { saveSession, deleteSession, nameFromText, loadHistory, saveDocument, loadDocument, removeDocument } from "./lib/history.js";
import { openingScreen } from "./screens/opening.js";
import { homeScreen } from "./screens/home.js";
import { studyScreen } from "./screens/study.js";
import { finishedScreen } from "./screens/finished.js";
import { historyScreen, SORTS } from "./screens/history.js";
import { loadingView } from "./components/loading.js";

const SORT_KEY = "studymode-history-sort";

function savedSort() {
  try {
    const sort = localStorage.getItem(SORT_KEY);
    if (sort in SORTS) return sort;
  } catch {}
  return "newest";
}

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
  sessionId: null,
  name: "",
  results: [], // per chunk: [{ question, options, correctIndex, explanation, picked, right }]
  historySort: savedSort(),
  viewingSession: null, // id of the session open in History
  restartedFrom: null, // after Start over: the old session whose saved text moves to this one
  storageFull: false, // true when this document's text couldn't be saved for later
  inputKind: null, // the Home Page card picked: "pdf", "docx", "web" or "paste"
  offerPaste: false, // a link couldn't be read, so the error offers "Paste text instead"
  source: "paste", // where this session's text came from: "pdf", "docx", "paste" or "web"
  error: null,
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
    update({
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

// Saves the session after a chunk's quiz. The chunk just quizzed is the last one done.
// An unfinished session also keeps its document text so it can be continued later;
// a finished one drops it to free up space.
// The score is saved first, so a full storage never costs the learner their score.
function saveToHistory() {
  const chunksDone = state.chunkIndex + 1;
  const finished = chunksDone === state.chunks.length;
  if (state.restartedFrom) {
    removeDocument(state.restartedFrom);
    state = { ...state, restartedFrom: null };
  }
  saveSession({
    id: state.sessionId,
    name: state.name,
    date: new Date().toISOString(),
    score: state.sessionScore,
    results: state.results,
    chunksDone,
    chunkCount: state.chunks.length,
    source: state.source,
    finished,
  });
  if (finished) {
    removeDocument(state.sessionId);
    state = { ...state, storageFull: false };
  } else {
    // If storage is full, studying carries on; the text is tried again after the next chunk.
    state = { ...state, storageFull: !saveDocument(state.sessionId, state.chunks) };
  }
}

const actions = {
  goTo(screen) {
    update({ screen, error: null, viewingSession: null });
  },

  // Picking a card on the Home Page shows only that card's input.
  pickInput(inputKind) {
    update({ inputKind, error: null, offerPaste: false });
  },

  // Web articles are read by the helper server, then studied like pasted text,
  // named after the article's title.
  async startFromLink(url) {
    if (!url.trim()) {
      update({ error: "Paste a link to an article first.", offerPaste: false });
      return;
    }
    update({ screen: "loading", error: null, offerPaste: false, chunks: [], chunkIndex: 0 });
    try {
      const { title, text } = await readArticle(url.trim());
      actions.startStudying(text, title, "web");
    } catch (err) {
      update({ screen: "home", error: err.message, offerPaste: true });
    }
  },

  // PDF and Word files are read in the browser, then studied like pasted text.
  // The session is named after the file.
  async startFromFile(file, reader, source) {
    if (!file) return;
    update({ screen: "loading", error: null, chunks: [], chunkIndex: 0 });
    try {
      actions.startStudying(await reader(file), file.name.replace(/\.(pdf|docx?)$/i, ""), source);
    } catch (err) {
      update({ screen: "home", error: err.message });
    }
  },

  startFromPdf(file) {
    return actions.startFromFile(file, readPdf, "pdf");
  },

  startFromDocx(file) {
    return actions.startFromFile(file, readDocx, "docx");
  },

  startStudying(text, name = "", source = "paste") {
    const chunks = chunkText(text);
    if (!chunks.length) {
      update({ screen: "home", error: "There's no text to study yet. Paste some notes first." });
      return;
    }
    state = {
      ...freshState(),
      chunks,
      sessionId: crypto.randomUUID(),
      name: name.trim() || nameFromText(text),
      source,
    };
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
    const q = state.round.quiz[state.quizPos];
    const right = i === q.correctIndex;
    const { correct, total } = state.chunkScore;
    const results = [...state.results];
    results[state.chunkIndex] = [...(results[state.chunkIndex] ?? []), { ...q, picked: i, right }];
    update({ picked: i, chunkScore: { correct: correct + (right ? 1 : 0), total }, results });
  },

  // After the last question, the chunk's score is added to the session score
  // and the session is saved to history.
  nextQuestion() {
    if (state.quizPos < state.round.quiz.length - 1) {
      update({ quizPos: state.quizPos + 1, picked: null });
      return;
    }
    const { correct, total } = state.sessionScore;
    state = {
      ...state,
      step: "score",
      sessionScore: { correct: correct + state.chunkScore.correct, total: total + state.chunkScore.total },
    };
    saveToHistory(); // before drawing, so a "storage is full" note shows straight away
    render();
  },

  nextChunk() {
    if (state.chunkIndex >= state.chunks.length - 1) {
      update({ screen: "finished" });
      return;
    }
    state = { ...state, chunkIndex: state.chunkIndex + 1 };
    loadRound();
  },

  // Continue: back to the start of the next unfinished chunk, with the score so far.
  resumeSession(id) {
    const session = loadHistory().find((s) => s.id === id);
    const chunks = loadDocument(id);
    if (!session || !chunks) return;
    state = {
      ...freshState(),
      chunks,
      chunkIndex: session.chunksDone,
      sessionId: session.id,
      name: session.name,
      source: session.source,
      results: session.results,
      sessionScore: session.score,
    };
    loadRound();
  },

  // Start over: the same document from chunk 1, as a new session.
  // The old entry stays in history; its saved text moves to the new session.
  restartSession(id) {
    const session = loadHistory().find((s) => s.id === id);
    const chunks = loadDocument(id);
    if (!session || !chunks) return;
    state = { ...freshState(), chunks, sessionId: crypto.randomUUID(), name: session.name, source: session.source, restartedFrom: id };
    loadRound();
  },

  retryChunk() {
    loadRound();
  },

  setHistorySort(historySort) {
    try {
      localStorage.setItem(SORT_KEY, historySort);
    } catch {}
    update({ historySort });
  },

  openSession(id) {
    update({ viewingSession: id });
  },

  closeSession() {
    update({ viewingSession: null });
  },

  // Frees the space a document takes. Its score and questions stay in history.
  removeSavedDocument(id, name) {
    if (!confirm(`Remove the saved document for "${name}"? Its score stays in your history, but it can't be continued.`)) return;
    removeDocument(id);
    render();
  },

  deleteSession(id, name) {
    if (!confirm(`Delete "${name}" from your history? This can't be undone.`)) return;
    deleteSession(id);
    render();
  },

  // Stopping mid-document: chunks with a finished quiz are already in history.
  leaveStudy() {
    const midChunk = state.step !== "score";
    const message = midChunk
      ? "Go back to the Home Page? Your progress in this chunk won't be kept, but finished chunks are saved in your history."
      : "Go back to the Home Page? Your finished chunks are saved in your history.";
    if (!confirm(message)) return;
    actions.startOver();
  },

  startOver() {
    state = { ...freshState(), screen: "home" };
    render();
  },
};

render();
setUpThemeToggle();
