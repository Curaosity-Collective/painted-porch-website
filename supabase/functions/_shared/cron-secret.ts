// The token that scheduled jobs send to auto-backup and github-sync-check.
//
// The database generates it and keeps it in Vault as "backup_cron_secret"
// (migration 20261125180000). The cron jobs read it from Vault, and these
// functions read the same value through public.get_backup_cron_secret(), which
// only the service role may call. Nobody copies the value by hand, so the jobs
// and the functions cannot drift apart. BACKUP_CRON_SECRET is the fallback for
// a project where the Vault entry doesn't exist yet.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export async function resolveCronSecret(supabaseUrl: string, serviceKey: string): Promise<string> {
  try {
    const { data, error } = await createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    }).rpc("get_backup_cron_secret");
    if (!error && typeof data === "string" && data !== "") return data;
    if (error) console.warn("get_backup_cron_secret failed; using BACKUP_CRON_SECRET", error.message);
  } catch (err) {
    console.warn("get_backup_cron_secret threw; using BACKUP_CRON_SECRET", (err as Error).message);
  }
  return Deno.env.get("BACKUP_CRON_SECRET") ?? "";
}
