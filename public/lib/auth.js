// Accounts in the browser: signing up, logging in and out, with Supabase.
// If the helper server has no Supabase settings, accounts stay off and
// StudyMode works exactly as before (history in this browser only).
let client = null;
let user = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

// Starts Supabase and calls onChange(event, user) whenever someone signs in or out.
// Returns false when accounts are off.
export async function setUpAuth(onChange) {
  try {
    const config = await (await fetch("/api/config")).json();
    if (!config.supabaseUrl) return false;
    await loadScript("/vendor/supabase/supabase.js");
    client = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
  } catch {
    return false;
  }
  client.auth.onAuthStateChange((event, session) => {
    user = session?.user ?? null;
    // Run after Supabase finishes its own work, so our code can call it safely.
    setTimeout(() => onChange(event, user), 0);
  });
  return true;
}

export const accountsOn = () => client !== null;
export const currentUser = () => user;

export function displayName(person) {
  const meta = person?.user_metadata ?? {};
  return meta.full_name || meta.name || person?.email || "";
}

// The signed-in person's pass, sent to the helper server with each request.
export async function accessToken() {
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.access_token ?? null;
}

// Supabase's error codes turned into friendly sentences.
function friendly(error) {
  const code = error?.code ?? "";
  const text = (error?.message ?? "").toLowerCase();
  if (code === "invalid_credentials" || text.includes("invalid login")) return "That email and password don't match. Check them and try again.";
  if (code === "email_not_confirmed" || text.includes("not confirmed")) return "Please confirm your email first: click the link we sent you, then log in.";
  if (code === "user_already_exists" || text.includes("already registered")) return "There's already an account with this email. Log in instead.";
  if (code === "weak_password" || text.includes("password should")) return "Pick a longer password: at least 8 characters.";
  if (code === "same_password") return "That's your current password. Pick a new one.";
  if (code.includes("rate_limit") || text.includes("rate limit")) return "Too many tries in a short time. Wait a minute and try again.";
  if (code === "validation_failed" || text.includes("invalid format")) return "That email doesn't look right. Check it and try again.";
  return "Something went wrong. Check your connection and try again.";
}

async function run(call) {
  try {
    const { data, error } = await call();
    if (error) throw error;
    return data;
  } catch (error) {
    console.warn("Sign-in problem:", error?.code ?? "", error?.message ?? error);
    throw new Error(friendly(error));
  }
}

const backHere = () => window.location.origin;

export function signInWithGoogle() {
  return run(() => client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: backHere() } }));
}

// Returns true when the account is ready, false when the email still needs confirming.
export async function signUp(name, email, password) {
  const data = await run(() =>
    client.auth.signUp({ email, password, options: { emailRedirectTo: backHere(), data: { full_name: name } } })
  );
  // Supabase hides whether an email is already taken: it returns a user with no identities.
  if (data.user && data.user.identities?.length === 0) throw new Error(friendly({ code: "user_already_exists" }));
  return Boolean(data.session);
}

export function logIn(email, password) {
  return run(() => client.auth.signInWithPassword({ email, password }));
}

export function sendPasswordReset(email) {
  return run(() => client.auth.resetPasswordForEmail(email, { redirectTo: backHere() }));
}

export function setNewPassword(password) {
  return run(() => client.auth.updateUser({ password }));
}

export function logOut() {
  return run(() => client.auth.signOut());
}
