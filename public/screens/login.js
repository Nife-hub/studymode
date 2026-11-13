// The sign-in screen: Continue with Google, or email and password.
// One screen, four forms: log in, sign up, forgot password, and set a new password
// (after clicking the reset link in the email).
import { el } from "../lib/dom.js";

const TITLES = {
  login: ["Welcome back", "Log in to see your history on any device."],
  signup: ["Make your account", "Your history and saved documents follow you to any device."],
  forgot: ["Forgot your password?", "Enter your email and we'll send you a link to pick a new one."],
  newPassword: ["Pick a new password", "At least 8 characters."],
};

function field(label, props) {
  return el("label", { class: "field" }, [el("span", {}, label), el("input", props)]);
}

function switchLink(text, linkText, mode, actions) {
  return el("p", { class: "soft switch-line" }, [
    text + " ",
    el("button", { class: "link-button", type: "button", onClick: () => actions.setLoginMode(mode) }, linkText),
  ]);
}

export function loginScreen(state, actions) {
  const mode = state.loginMode;
  const [title, intro] = TITLES[mode];
  const busy = state.authBusy;

  const onSubmit = (event) => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    actions.submitLogin(mode, form);
  };

  const fields = {
    login: [
      field("Email", { type: "email", name: "email", required: true, autocomplete: "email" }),
      field("Password", { type: "password", name: "password", required: true, autocomplete: "current-password" }),
    ],
    signup: [
      field("Your name (optional)", { type: "text", name: "name", autocomplete: "name" }),
      field("Email", { type: "email", name: "email", required: true, autocomplete: "email" }),
      field("Password (at least 8 characters)", { type: "password", name: "password", required: true, minLength: 8, autocomplete: "new-password" }),
    ],
    forgot: [field("Email", { type: "email", name: "email", required: true, autocomplete: "email" })],
    newPassword: [
      field("New password", { type: "password", name: "password", required: true, minLength: 8, autocomplete: "new-password" }),
    ],
  }[mode];

  const submitLabel = { login: "Log in", signup: "Sign up", forgot: "Send the link", newPassword: "Save new password" }[mode];
  const withGoogle = mode === "login" || mode === "signup";

  return el("main", { class: "screen login" }, [
    el("section", { class: "card login-card" }, [
      el("h1", {}, title),
      el("p", { class: "soft" }, intro),
      withGoogle &&
        el("button", { class: "button secondary google-button", type: "button", disabled: busy, onClick: () => actions.continueWithGoogle() }, [
          el("span", { class: "google-g", "aria-hidden": "true" }, "G"),
          "Continue with Google",
        ]),
      withGoogle && el("p", { class: "or-line soft" }, "or with email"),
      el("form", { class: "login-form", onSubmit }, [
        ...fields,
        mode === "login" &&
          el("button", { class: "link-button forgot", type: "button", onClick: () => actions.setLoginMode("forgot") }, "Forgot password?"),
        el("button", { class: "button", type: "submit", disabled: busy }, busy ? "One moment…" : submitLabel),
      ]),
      state.authMessage && el("p", { class: "notice", role: "status" }, state.authMessage),
      state.error && el("div", { class: "error", role: "alert" }, el("p", {}, state.error)),
      mode === "login" && switchLink("New to StudyMode?", "Make an account", "signup", actions),
      mode === "signup" && switchLink("Already have an account?", "Log in", "login", actions),
      mode === "forgot" && switchLink("Remembered it?", "Back to log in", "login", actions),
      el("div", { class: "actions center" }, [
        el("button", { class: "button secondary", type: "button", onClick: () => actions.closeLogin() }, "← Back"),
      ]),
      el("p", { class: "soft small center" },
        el("button", { class: "link-button", type: "button", onClick: () => actions.openPrivacy() }, "What we store (privacy)")),
    ]),
  ]);
}
