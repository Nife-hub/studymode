// Asks the helper server to read a web article. Returns { title, text }.
// The server does the visiting, because a web page isn't allowed to read other websites itself.
const CANT_READ =
  "We couldn't read the article at this link. It might need a login, be behind a paywall, or block apps like StudyMode. Try pasting the text instead.";

export async function readArticle(url) {
  let response;
  try {
    response = await fetch("/api/article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    throw new Error(CANT_READ);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.text) throw new Error(data?.error ?? CANT_READ);
  return data;
}
