// Sends one chunk to the helper server and returns its study round.
const FRIENDLY_ERROR = "We couldn't prepare this chunk. Check your connection and try again.";

export async function fetchStudyRound(chunkText, chunkNumber, totalChunks) {
  let response;
  try {
    response = await fetch("/api/study-round", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chunkText, chunkNumber, totalChunks }),
    });
  } catch {
    throw new Error(FRIENDLY_ERROR);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.error ?? FRIENDLY_ERROR);
  return data;
}
