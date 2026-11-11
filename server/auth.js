// Accounts: works out who is signed in, using Supabase.
// Supabase's address and publishable key are safe to share with the browser
// (they only allow what each signed-in person is allowed to do), so the page
// gets them from /api/config. Without them in .env, accounts are simply off.
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

export const accountsOn = Boolean(url && key);

const supabase = accountsOn ? createClient(url, key, { auth: { persistSession: false } }) : null;

export function publicConfig() {
  return accountsOn ? { supabaseUrl: url, supabaseKey: key } : {};
}

// Reads the "Authorization: Bearer <token>" the page sends and asks Supabase whose it is.
// Returns the person, or null for a guest (or a token that's expired or fake).
export async function whoIsAsking(req) {
  if (!supabase) return null;
  const token = req.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    return error ? null : data.user;
  } catch {
    return null;
  }
}
