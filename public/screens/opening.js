// Opening Page: the name, one line about it, and Get started.
import { el } from "../lib/dom.js";

export function openingScreen(state, actions) {
  return el("main", { class: "screen opening" }, [
    el("h1", { class: "brand" }, "StudyMode"),
    el("p", { class: "tagline" }, "Long reading, made into short study rounds."),
    el("button", { class: "button large", onClick: () => actions.goTo("home") }, "Get started"),
  ]);
}
