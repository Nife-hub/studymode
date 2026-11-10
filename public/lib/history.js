// Score history: past study sessions, saved in this browser's localStorage.
// Storage can be blocked or full, so every read and write is wrapped in try/catch.
const KEY = "studymode-history";

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

// Adds the session, or replaces the saved copy that has the same id.
export function saveSession(session) {
  const others = loadHistory().filter((s) => s.id !== session.id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...others, session]));
  } catch {}
}

export function deleteSession(id) {
  try {
    localStorage.setItem(KEY, JSON.stringify(loadHistory().filter((s) => s.id !== id)));
  } catch {}
}

// A name for pasted text with no name given: its first few words.
export function nameFromText(text, words = 6) {
  const all = text.trim().split(/\s+/);
  return all.slice(0, words).join(" ") + (all.length > words ? "…" : "");
}
