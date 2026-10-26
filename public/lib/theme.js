// Light/dark mode: follows the computer's setting until the toggle is pressed,
// then remembers the choice in this browser.
const KEY = "studymode-theme";
const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)");

function currentTheme() {
  return document.documentElement.dataset.theme ?? (systemDark?.matches ? "dark" : "light");
}

function showButton(button) {
  const dark = currentTheme() === "dark";
  button.textContent = dark ? "☀️" : "🌙";
  button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  button.title = button.getAttribute("aria-label");
}

export function setUpThemeToggle() {
  const button = document.getElementById("theme-toggle");
  if (!button) return;
  showButton(button);
  button.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    showButton(button);
  });
  systemDark?.addEventListener?.("change", () => showButton(button));
}
