// The Home Page's picture cards: one per way of bringing in study material.
// The illustrations are small inline drawings that use the page's color variables,
// so they follow light and dark mode.
import { el } from "../lib/dom.js";

const PICTURES = {
  pdf: `
    <svg viewBox="0 0 120 90" aria-hidden="true">
      <path class="pic-paper" d="M38 8 H72 L86 22 V82 H38 Z" />
      <path class="pic-fold" d="M72 8 V22 H86" />
      <path class="pic-line" d="M46 34 H78 M46 42 H78 M46 50 H70 M46 58 H76 M46 66 H64" />
      <rect class="pic-badge pdf" x="22" y="52" width="40" height="22" rx="7" />
      <text class="pic-badge-text" x="42" y="67.5" text-anchor="middle">PDF</text>
    </svg>`,
  docx: `
    <svg viewBox="0 0 120 90" aria-hidden="true">
      <path class="pic-paper" d="M42 8 H76 L90 22 V82 H42 Z" />
      <path class="pic-fold" d="M76 8 V22 H90" />
      <path class="pic-line" d="M50 34 H82 M50 42 H82 M50 50 H76 M50 58 H82 M50 66 H70" />
      <rect class="pic-badge docx" x="22" y="26" width="32" height="32" rx="8" />
      <text class="pic-badge-text big" x="38" y="49" text-anchor="middle">W</text>
    </svg>`,
  web: `
    <svg viewBox="0 0 120 90" aria-hidden="true">
      <rect class="pic-paper" x="14" y="12" width="92" height="66" rx="8" />
      <path class="pic-fold" d="M14 26 H106" />
      <circle class="pic-dot" cx="23" cy="19" r="2.5" /><circle class="pic-dot" cx="31" cy="19" r="2.5" /><circle class="pic-dot" cx="39" cy="19" r="2.5" />
      <circle class="pic-globe" cx="40" cy="52" r="15" />
      <path class="pic-globe-line" d="M25 52 H55 M40 37 C32 45 32 59 40 67 M40 37 C48 45 48 59 40 67" />
      <path class="pic-line" d="M64 40 H96 M64 48 H96 M64 56 H88 M64 64 H92" />
    </svg>`,
  paste: `
    <svg viewBox="0 0 120 90" aria-hidden="true">
      <rect class="pic-paper" x="34" y="14" width="52" height="68" rx="8" />
      <rect class="pic-clip" x="48" y="8" width="24" height="12" rx="4" />
      <rect class="pic-highlight" x="42" y="31" width="30" height="8" rx="3" />
      <path class="pic-line" d="M42 35 H78 M42 46 H78 M42 56 H72 M42 66 H76" />
      <path class="pic-pencil" d="M78 74 L84 62 L100 46 L106 52 L90 68 Z M84 62 L90 68" />
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
