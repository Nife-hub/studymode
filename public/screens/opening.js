// Opening Page: the name, one line about it, and Get started.
import { el } from "../lib/dom.js";

export function openingScreen(state, actions) {
  return el("main", { class: "screen opening" }, [
    el("span", { class: "brand-emoji", "aria-hidden": "true" }, "📚"),
    el("h1", { class: "brand" }, "StudyMode"),
    el("p", { class: "tagline" }, "Big reading, bite-sized wins."),
    el("button", { class: "button large", onClick: () => actions.goTo("home") }, "Get started"),
  ]);
}
