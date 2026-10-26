// Flashcards: choose how many (1–10), then tap a card to flip it. Your own cards come last.
import { el } from "../lib/dom.js";

export function flashcardsView(state, actions) {
  const ownCards = state.ownCards[state.chunkIndex] ?? [];
  const cards = [
    ...state.round.flashcards.slice(0, state.cardCount),
    ...ownCards.map((card) => ({ ...card, yours: true })),
  ];

  const picker = el(
    "div",
    { class: "count-picker", role: "group", "aria-label": "How many cards?" },
    Array.from({ length: 10 }, (_, i) => i + 1).map((n) =>
      el("button", {
        class: n === state.cardCount ? "count selected" : "count",
        "aria-pressed": String(n === state.cardCount),
        onClick: () => actions.setCardCount(n),
      }, String(n))
    )
  );

  return el("section", {}, [
    el("div", { class: "card" }, [el("h2", {}, "How many cards?"), picker]),
    el("p", { class: "soft hint" }, "Tap a card to flip it."),
    el("div", { class: "flashcards" }, cards.map(flashcard)),
    el("div", { class: "actions" }, [
      el("button", { class: "button secondary", onClick: () => actions.setStep("summary") }, "Back to key points"),
      el("button", { class: "button", onClick: () => actions.setStep("quiz") }, "Go to quiz"),
    ]),
  ]);
}

// A flip is only visual, so it toggles a class on this card instead of redrawing the page.
function flashcard(card) {
  const node = el("button", { class: "flashcard", "aria-label": `Flashcard: ${card.front}. Tap to flip.` }, [
    el("div", { class: "flashcard-inner" }, [
      el("div", { class: "face front" }, [
        el("span", { class: "face-label" }, card.yours ? "Front · Yours" : "Front"),
        el("p", {}, card.front),
      ]),
      el("div", { class: "face back" }, [el("span", { class: "face-label" }, "Back"), el("p", {}, card.back)]),
    ]),
  ]);
  node.addEventListener("click", () => node.classList.toggle("flipped"));
  return node;
}
