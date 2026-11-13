// Score history: past study sessions and the saved text of unfinished ones.
//
// Two places it can live:
// - Signed out: this browser's localStorage, as before.
// - Signed in: the person's account in Supabase, so it follows them to any device.
//
// The rest of the app reads history straight away (no waiting), so when signed in
// the account's history is kept in memory here: it's fetched once at sign-in, and
// every change updates the memory copy at once and is sent to Supabase in the
// background, one change at a time, in order.
const KEY = "studymode-history";
const DOC_PREFIX = "studymode-doc-";

let db = null; // the Supabase client while signed in, otherwise null (browser mode)
let ready = true; // false while the account's history is being fetched
let sessions = []; // signed in: the account's sessions
let docSizes = new Map(); // signed in: id → size in bytes of each saved document
let docCache = new Map(); // signed in: id → chunks, for documents fetched or saved this visit
let queue = Promise.resolve();
let syncFailed = false;
let switches = 0; // counts sign-ins and outs, so a slow fetch for a previous person is ignored

export const historyReady = () => ready;
export const historyInAccount = () => db !== null;
export const syncProblem = () => syncFailed;

// Runs Supabase writes one after another, so they arrive in the order they happened.
function send(write) {
  queue = queue.then(async () => {
    const { error } = await write();
    if (error) throw error;
  }).catch((error) => {
    console.warn("Couldn't save to your account:", error?.message ?? error);
    syncFailed = true;
  });
  return queue;
}

// ---- Browser storage (signed out) ----

function localSessions() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

function localDocument(id) {
  try {
    const chunks = JSON.parse(localStorage.getItem(DOC_PREFIX + id));
    return Array.isArray(chunks) && chunks.length ? chunks : null;
  } catch {
    return null;
  }
}

function localKeySize(key) {
  try {
    return (key.length + (localStorage.getItem(key)?.length ?? 0)) * 2; // browsers store 2 bytes per character
  } catch {
    return 0;
  }
}

// ---- Switching between browser and account ----

// Called whenever someone signs in or out. `client` is Supabase's client, or null.
// On sign-in, history saved in this browser moves into the account first, so
// nothing is lost; it's then cleared from the browser, so it only moves once.
export async function useAccount(client, onReady) {
  const mine = ++switches;
  if (!client) {
    db = null;
    ready = true;
    sessions = [];
    docSizes = new Map();
    docCache = new Map();
    syncFailed = false;
    onReady?.();
    return;
  }
  db = client;
  ready = false;
  syncFailed = false;
  sessions = [];
  docSizes = new Map();
  docCache = new Map();
  let fetched = null;
  try {
    await moveBrowserHistoryIn(client);
    const [s, d] = await Promise.all([
      client.from("study_sessions").select("data"),
      client.from("saved_documents").select("id, size"),
    ]);
    if (s.error) throw s.error;
    if (d.error) throw d.error;
    fetched = { s, d };
  } catch (error) {
    console.warn("Couldn't load your account's history:", error?.message ?? error);
    if (mine === switches) syncFailed = true;
  }
  if (mine !== switches) return; // someone else signed in or out meanwhile
  if (fetched) {
    const { s, d } = fetched;
    // Anything saved while this was loading (a chunk finished meanwhile) is newer, so it wins.
    const savedMeanwhile = new Set(sessions.map((x) => x.id));
    sessions = [...s.data.map((row) => row.data).filter((x) => !savedMeanwhile.has(x.id)), ...sessions];
    docSizes = new Map([...d.data.map((row) => [row.id, row.size]), ...docSizes]);
  }
  ready = true;
  onReady?.();
}

async function moveBrowserHistoryIn(db) {
  const local = localSessions();
  if (!local.length) return;
  const rows = local.map((session) => ({ id: session.id, data: session }));
  const { error } = await db.from("study_sessions").upsert(rows);
  if (error) throw error;
  for (const session of local) {
    const chunks = localDocument(session.id);
    if (!chunks) continue;
    // A document that doesn't fit in the account stays in this browser rather than failing the move.
    const { error: docError } = await db.from("saved_documents").upsert({ id: session.id, chunks });
    if (docError) console.warn("A saved document didn't fit in your account:", docError.message);
    else removeLocalDocument(session.id);
  }
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

function removeLocalDocument(id) {
  try {
    localStorage.removeItem(DOC_PREFIX + id);
  } catch {}
}

// ---- What the app calls ----

export function loadHistory() {
  return db ? [...sessions] : localSessions();
}

// Adds the session, or replaces the saved copy that has the same id.
export function saveSession(session) {
  if (db) {
    sessions = [...sessions.filter((s) => s.id !== session.id), session];
    send(() => db.from("study_sessions").upsert({ id: session.id, data: session, updated_at: new Date().toISOString() }));
    return;
  }
  const others = localSessions().filter((s) => s.id !== session.id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...others, session]));
  } catch {}
}

export function deleteSession(id) {
  if (db) {
    sessions = sessions.filter((s) => s.id !== id);
    send(() => db.from("study_sessions").delete().eq("id", id));
  } else {
    try {
      localStorage.setItem(KEY, JSON.stringify(localSessions().filter((s) => s.id !== id)));
    } catch {}
  }
  removeDocument(id);
}

// An unfinished session's document text (its chunks) is kept separately,
// so the history list stays quick to load. Returns false if it doesn't fit.
export function saveDocument(id, chunks) {
  if (db) {
    if (docSizes.has(id)) return true;
    const size = new TextEncoder().encode(JSON.stringify(chunks)).length;
    if (savedDocumentsSize() + size > STORAGE_LIMIT) return false;
    docSizes.set(id, size);
    docCache.set(id, chunks);
    send(() => db.from("saved_documents").upsert({ id, chunks }));
    return true;
  }
  try {
    if (localStorage.getItem(DOC_PREFIX + id) === null) localStorage.setItem(DOC_PREFIX + id, JSON.stringify(chunks));
    return true;
  } catch {
    return false;
  }
}

export const hasDocument = (id) => (db ? docSizes.has(id) : localDocument(id) !== null);

// Gives back the chunks, or null. Signed in, the text is fetched from the account,
// so this always returns a promise.
export async function loadDocument(id) {
  if (!db) return localDocument(id);
  if (docCache.has(id)) return docCache.get(id);
  await queue; // a document saved moments ago may still be on its way
  const { data, error } = await db.from("saved_documents").select("chunks").eq("id", id).maybeSingle();
  if (error || !Array.isArray(data?.chunks) || !data.chunks.length) return null;
  docCache.set(id, data.chunks);
  return data.chunks;
}

export function removeDocument(id) {
  if (db) {
    if (!docSizes.has(id)) return;
    docSizes.delete(id);
    docCache.delete(id);
    send(() => db.from("saved_documents").delete().eq("id", id));
    return;
  }
  removeLocalDocument(id);
}

// Signed out: browsers give each site about 5 MB and don't report the exact limit,
// so this is an estimate. Signed in: each account gets 5 MB.
export const STORAGE_LIMIT = 5 * 1024 * 1024;

export function documentSize(id) {
  if (db) return docSizes.get(id) ?? 0;
  return localDocument(id) ? localKeySize(DOC_PREFIX + id) : 0;
}

// Space taken by all saved documents together.
export function savedDocumentsSize() {
  if (db) return [...docSizes.values()].reduce((sum, size) => sum + size, 0);
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(DOC_PREFIX)) total += localKeySize(key);
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
