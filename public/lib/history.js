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
  removeDocument(id);
}

// An unfinished session's document text (its chunks) is kept under its own key,
// so the history list stays quick to load. Returns false if it couldn't be saved.
const docKey = (id) => `studymode-doc-${id}`;

export function saveDocument(id, chunks) {
  try {
    if (localStorage.getItem(docKey(id)) === null) localStorage.setItem(docKey(id), JSON.stringify(chunks));
    return true;
  } catch {
    return false;
  }
}

export function loadDocument(id) {
  try {
    const chunks = JSON.parse(localStorage.getItem(docKey(id)));
    return Array.isArray(chunks) && chunks.length ? chunks : null;
  } catch {
    return null;
  }
}

export function removeDocument(id) {
  try {
    localStorage.removeItem(docKey(id));
  } catch {}
}

// Browsers give each site about 5 MB here. They don't report the exact limit,
// so this is an estimate: browsers store 2 bytes per character.
export const STORAGE_LIMIT = 5 * 1024 * 1024;

function keySize(key) {
  try {
    return (key.length + (localStorage.getItem(key)?.length ?? 0)) * 2;
  } catch {
    return 0;
  }
}

export const documentSize = (id) => (loadDocument(id) ? keySize(docKey(id)) : 0);

// Space taken by all saved documents together.
export function savedDocumentsSize() {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("studymode-doc-")) total += keySize(key);
    }
    return total;
  } catch {
    return 0;
  }
}

// 1234567 → "1.2 MB", 45000 → "44 KB"
export function formatSize(bytes) {
  if (bytes >= 100 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// A name for pasted text with no name given: its first few words.
export function nameFromText(text, words = 6) {
  const all = text.trim().split(/\s+/);
  return all.slice(0, words).join(" ") + (all.length > words ? "…" : "");
}
