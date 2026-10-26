// The heart of the page: one `state` object, small actions that change it, and render().
import { chunkText } from "./lib/chunkText.js";
import { fetchStudyRound } from "./lib/api.js";
import { homeScreen } from "./screens/home.js";
import { studyScreen } from "./screens/study.js";
import { loadingView } from "./components/loading.js";

const freshState = () => ({
  screen: "home",
  chunks: [],
  chunkIndex: 0,
  round: null,
  step: "summary",
  error: null,
});

let state = freshState();

const screens = {
  home: homeScreen,
  loading: loadingView,
  study: studyScreen,
};

function render() {
  const app = document.getElementById("app");
  app.replaceChildren(screens[state.screen](state, actions));
  window.scrollTo(0, 0);
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

  startStudying(text) {
    const chunks = chunkText(text);
    if (!chunks.length) {
      update({ error: "There's no text to study yet. Paste some notes first." });
      return;
    }
    state = { ...freshState(), chunks };
    loadRound();
  },
};

render();
