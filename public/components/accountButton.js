// Top-right account button, next to the light/dark toggle.
// Signed out: "Log in". Signed in: the person's name, opening a small menu with Log out.
import { el } from "../lib/dom.js";
import { accountsOn, currentUser, displayName } from "../lib/auth.js";

export function accountButton(state, actions) {
  // Hidden when accounts are off, on the sign-in screen itself, and while a chunk is loading.
  if (!accountsOn() || state.screen === "login" || state.screen === "loading") return [];
  const person = currentUser();
  if (!person) {
    return el("button", { class: "account-pill", type: "button", onClick: () => actions.openLogin() }, "Log in");
  }
  return el("details", { class: "account-menu" }, [
    el("summary", { class: "account-pill", title: person.email }, [
      el("span", { "aria-hidden": "true" }, "👤 "),
      el("span", { class: "account-name" }, displayName(person)),
    ]),
    el("div", { class: "account-dropdown card" }, [
      el("p", { class: "soft account-email" }, person.email),
      el("button", { class: "button secondary small-button", type: "button", onClick: () => actions.logOut() }, "Log out"),
    ]),
  ]);
}
