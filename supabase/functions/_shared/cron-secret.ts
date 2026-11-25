// The token that scheduled jobs send to auto-backup and github-sync-check.
//
// The database generates it and keeps it in Vault as "backup_cron_secret"
// (migration 20261125180000). The cron jobs read it from Vault, and these
// functions read the same value through public.get_backup_cron_secret(), which
// only the service role may call. Nobody copies the value by hand, so the jobs
// and the functions cannot drift apart.
//
// It is looked up when a request needs it, not when the function starts, and
// only a value read from Vault is kept. An instance that started before the
// Vault entry existed would otherwise keep refusing scheduled calls until it
// was recycled. BACKUP_CRON_SECRET is the fallback when Vault can't be read.
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

let vaultSecret = "";
// One client per instance, without the auth timers a default client starts, so
// repeated lookups while Vault can't be read don't pile up background work.
let client: SupabaseClient | null = null;

export async function getCronSecret(supabaseUrl: string, serviceKey: string): Promise<string> {
  if (vaultSecret) return vaultSecret;
  try {
    client ??= createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await client.rpc("get_backup_cron_secret");
    if (!error && typeof data === "string" && data !== "") {
      vaultSecret = data;
      return vaultSecret;
    }
    if (error) console.warn("get_backup_cron_secret failed; using BACKUP_CRON_SECRET", error.message);
  } catch (err) {
    console.warn("get_backup_cron_secret threw; using BACKUP_CRON_SECRET", (err as Error).message);
  }
  return Deno.env.get("BACKUP_CRON_SECRET") ?? "";
}
