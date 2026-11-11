// The Home Page's picture cards: one per way of bringing in study material.
// The illustrations are small inline drawings that use the page's color variables,
// so they follow light and dark mode.
import { el } from "../lib/dom.js";

const PICTURES = {
  // A solid red PDF file, the way file icons show PDFs everywhere.
  pdf: `
    <svg viewBox="0 0 120 90" aria-hidden="true">
      <path class="pic-file pdf" d="M36 6 H70 L88 24 V80 Q88 86 82 86 H42 Q36 86 36 80 Z" />
      <path class="pic-file-fold pdf" d="M70 6 V20 Q70 24 74 24 H88 Z" />
      <rect class="pic-tag" x="28" y="48" width="52" height="22" rx="6" />
      <text class="pic-tag-text pdf" x="54" y="64.5" text-anchor="middle">PDF</text>
    </svg>`,
  // A blue Word tile with a big W, and the document's pages peeking out behind it.
  docx: `
    <svg viewBox="0 0 120 90" aria-hidden="true">
      <rect class="pic-page" x="52" y="12" width="44" height="66" rx="6" />
      <path class="pic-page-line" d="M66 28 H88 M66 38 H88 M66 48 H88 M66 58 H88 M66 68 H82" />
      <rect class="pic-tile docx" x="24" y="22" width="46" height="46" rx="10" />
      <text class="pic-tile-text" x="47" y="54" text-anchor="middle">W</text>
    </svg>`,
  // A globe with a link chain: a page somewhere on the web.
  web: `
    <svg viewBox="0 0 120 90" aria-hidden="true">
      <circle class="pic-globe-fill" cx="54" cy="44" r="32" />
      <path class="pic-globe-grid" d="M22 44 H86 M27 28 H81 M27 60 H81 M54 12 C38 26 38 62 54 76 M54 12 C70 26 70 62 54 76 M54 12 V76" />
      <g class="pic-chain">
        <rect x="70" y="58" width="22" height="13" rx="6.5" transform="rotate(-35 81 64.5)" />
        <rect x="82" y="50" width="22" height="13" rx="6.5" transform="rotate(-35 93 56.5)" />
      </g>
    </svg>`,
  // A clipboard with notes on it: the usual sign for pasting.
  paste: `
    <svg viewBox="0 0 120 90" aria-hidden="true">
      <rect class="pic-board" x="32" y="10" width="56" height="76" rx="8" />
      <rect class="pic-board-paper" x="39" y="20" width="42" height="58" rx="4" />
      <rect class="pic-clip" x="48" y="5" width="24" height="12" rx="4" />
      <rect class="pic-highlight" x="44" y="30" width="26" height="7" rx="3" />
      <path class="pic-line" d="M45 33.5 H75 M45 45 H75 M45 55 H70 M45 65 H73" />
    </svg>`,
};

export const INPUT_KINDS = [
  ["pdf", "PDF", "Upload a PDF file"],
  ["docx", "Word document", "Upload a .docx file"],
  ["web", "Web article", "Paste a link to a page"],
  ["paste", "Paste text", "Notes, an email, anything"],
];

export function inputCards(state, actions) {
  return el("div", { class: "input-cards", role: "group", "aria-label": "Choose how to add your study material" },
    INPUT_KINDS.map(([kind, title, hint]) =>
      el("button", {
        class: state.inputKind === kind ? "input-card picked" : "input-card",
        "aria-pressed": state.inputKind === kind ? "true" : "false",
        onClick: () => actions.pickInput(kind),
      }, [
        el("span", { class: `input-pic ${kind}`, innerHTML: PICTURES[kind] }),
        el("span", { class: "input-title" }, title),
        el("span", { class: "soft input-hint" }, hint),
      ])
    )
  );
}
