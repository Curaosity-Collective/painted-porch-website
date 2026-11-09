/**
 * Build scripts run under plain `node`, which (unlike Vite) does not read
 * `.env`. Import this module first so the scripts see the same VITE_* and
 * SUPABASE_* values the app is built with. Variables already set in the
 * environment win, as with Vite.
 *
 * Only the public (publishable) key is expected here. Nothing in the build
 * needs a service-role key.
 */
import { loadEnv } from "vite";

const mode = process.env.NODE_ENV === "development" ? "development" : "production";
const fileEnv = loadEnv(mode, process.cwd(), ["VITE_", "SUPABASE_"]);
for (const [key, value] of Object.entries(fileEnv)) {
  if (process.env[key] === undefined) process.env[key] = value;
}

/** The project URL and public key, or null when either is missing. */
export function publicSupabaseEnv() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";
  return url && key ? { url, key } : null;
}
