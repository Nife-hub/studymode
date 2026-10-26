// The heart of the page: one `state` object, small actions that change it, and render().
import { chunkText } from "./lib/chunkText.js";
import { fetchStudyRound } from "./lib/api.js";
import { readPdf } from "./lib/readPdf.js";
import { homeScreen } from "./screens/home.js";
import { studyScreen } from "./screens/study.js";
import { loadingView } from "./components/loading.js";

const freshState = () => ({
  screen: "home",
  chunks: [],
  chunkIndex: 0,
  round: null,
  step: "summary",
  ownCards: {},
  cardCount: 5,
  editingCard: false,
  error: null,
});

let state = freshState();

const screens = {
  home: homeScreen,
  loading: loadingView,
  study: studyScreen,
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
async function loadRound() {
  update({ screen: "loading", error: null });
  try {
    const round = await fetchStudyRound(state.chunks[state.chunkIndex], state.chunkIndex + 1, state.chunks.length);
    update({ screen: "study", round, step: "summary" });
  } catch (err) {
    update({ screen: "home", error: err.message });
  }
}

const actions = {
  goTo(screen) {
    update({ screen, error: null });
  },

  async startFromPdf(file) {
    update({ screen: "loading", error: null, chunkIndex: 0 });
    try {
      actions.startStudying(await readPdf(file));
    } catch (err) {
      update({ screen: "home", error: err.message });
    }
  },

  startStudying(text) {
    const chunks = chunkText(text);
    if (!chunks.length) {
      update({ screen: "home", error: "There's no text to study yet. Paste some notes first." });
      return;
    }
    state = { ...freshState(), chunks };
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
};

render();
