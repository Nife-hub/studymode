// Score history, saved in this browser's localStorage (no accounts, nothing sent anywhere).
// Every read and write is wrapped in try/catch: if the browser blocks storage,
// studying still works and history is simply empty.
const KEY = "studymode-history";

export function loadHistory() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveHistory(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

// Changes one session (found by id) and saves the whole list.
function changeSession(id, change) {
  const list = loadHistory();
  const session = list.find((s) => s.id === id);
  if (!session) return false;
  change(session);
  return saveHistory(list);
}

// A new session goes at the front of the list, so the newest is shown first.
export function createSession(name, chunkCount) {
  const session = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    date: new Date().toISOString(),
    chunkCount,
    chunksDone: 0,
    correct: 0,
    total: 0,
    finished: false,
    chunks: [],
  };
  saveHistory([session, ...loadHistory()]);
  return session.id;
}

// Saves one finished chunk: each question with the answer picked, plus the new total score.
export function recordChunk(id, chunkIndex, questions, sessionScore) {
  return changeSession(id, (session) => {
    session.chunks[chunkIndex] = { questions };
    session.chunksDone = chunkIndex + 1;
    session.correct = sessionScore.correct;
    session.total = sessionScore.total;
    session.finished = session.chunksDone >= session.chunkCount;
  });
}

// The name for pasted text when the name box is left empty: its first few words.
export function nameFromText(text, words = 5) {
  const all = text.trim().split(/\s+/);
  return all.slice(0, words).join(" ") + (all.length > words ? "…" : "");
}

// "notes.pdf" → "notes"
export function nameFromFile(fileName) {
  return fileName.replace(/\.pdf$/i, "") || "Untitled PDF";
}
