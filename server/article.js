// Web articles: fetch a public page and pull out its main text with Readability
// (the same idea as a browser's "reader view").
//
// Safety: StudyMode may run on a public host, so it only visits public web addresses.
// Links to this computer or a private network (home routers, office machines, cloud
// metadata addresses) are refused, and so is every redirect that leads to one.
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

export const CANT_READ =
  "We couldn't read the article at this link. It might need a login, be behind a paywall, or block apps like StudyMode. Try pasting the text instead.";
export const NOT_A_LINK = "That doesn't look like a web link. Copy the full address, starting with https://";

const TIME_LIMIT_MS = 10_000;
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const MIN_WORDS = 150; // less than this is usually a paywall teaser or a login page

export class ArticleError extends Error {
  constructor(message, reason) {
    super(message);
    this.reason = reason; // for the terminal log only
  }
}

// --- Only public addresses ---------------------------------------------------

function isPrivateV4(ip) {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 || a === 10 || a === 127 || a >= 224 || // "this network", private, loopback, multicast/reserved
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local, including cloud metadata (169.254.169.254)
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

function isPrivateV6(ip) {
  const v = ip.toLowerCase();
  if (v === "::" || v === "::1") return true;
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateV4(mapped[1]);
  return /^(fc|fd|fe[89ab]|ff)/.test(v); // unique-local, link-local, multicast
}

const isPrivate = (ip) => (isIP(ip) === 4 ? isPrivateV4(ip) : isPrivateV6(ip));

async function checkPublic(url) {
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new ArticleError(NOT_A_LINK, `protocol ${url.protocol}`);
  if (url.username || url.password) throw new ArticleError(NOT_A_LINK, "link has a username or password");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  let addresses;
  try {
    addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  } catch {
    throw new ArticleError(CANT_READ, `couldn't find ${host}`);
  }
  if (!addresses.length || addresses.some(({ address }) => isPrivate(address))) {
    throw new ArticleError(CANT_READ, `${host} is not a public address`);
  }
}

// --- Fetching ----------------------------------------------------------------

async function fetchPage(link) {
  let url = link;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await checkPublic(url);
    let response;
    try {
      response = await fetch(url, {
        redirect: "manual", // each redirect is checked before following it
        signal: AbortSignal.timeout(TIME_LIMIT_MS),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; StudyMode/0.1; +https://github.com/Nife-hub/studymode)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } catch (err) {
      throw new ArticleError(CANT_READ, `fetch failed: ${err.message}`);
    }

    if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
      url = new URL(response.headers.get("location"), url);
      continue;
    }
    if (!response.ok) throw new ArticleError(CANT_READ, `status ${response.status}`);

    const type = response.headers.get("content-type") ?? "";
    if (!/text\/html|application\/xhtml\+xml/i.test(type)) throw new ArticleError(CANT_READ, `not a web page (${type})`);
    return { html: await readLimited(response), url };
  }
  throw new ArticleError(CANT_READ, "too many redirects");
}

async function readLimited(response) {
  const reader = response.body.getReader();
  const parts = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_BYTES) {
      reader.cancel();
      throw new ArticleError(CANT_READ, "page is larger than 5 MB");
    }
    parts.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(parts));
}

// --- Pulling out the article ---------------------------------------------------

const BLOCKS = "p, li, h1, h2, h3, h4, h5, h6, blockquote, pre, figcaption, td, dd, dt";

// Readability returns the article as HTML. Each paragraph, heading or list item
// becomes its own paragraph of plain text, so the chunker can cut between them.
function toText(articleHtml) {
  const { document } = parseHTML(`<!doctype html><html><body>${articleHtml}</body></html>`);
  for (const block of document.querySelectorAll(BLOCKS)) block.after(document.createTextNode("\n\n"));
  return document.body.textContent
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

export async function readArticle(link) {
  let url;
  try {
    url = new URL(String(link ?? "").trim());
  } catch {
    throw new ArticleError(NOT_A_LINK, "not a URL");
  }

  const page = await fetchPage(url);
  const { document } = parseHTML(page.html);
  const article = new Readability(document).parse();
  const text = article?.content ? toText(article.content) : "";
  const words = (text.match(/\S+/g) ?? []).length;
  if (words < MIN_WORDS) throw new ArticleError(CANT_READ, `only ${words} words found`);

  const title = (article.title || document.title || page.url.hostname).replace(/\s+/g, " ").trim();
  return { title, text };
}
