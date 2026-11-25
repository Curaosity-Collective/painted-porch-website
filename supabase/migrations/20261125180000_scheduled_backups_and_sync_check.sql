-- Status: Applied 2026-11-25 via Lovable database connector, run by a Claude session because Lovable's chat agent may not touch Vault. PPS Admin approved this route: "Yes to both, apply it and add the guard". Read-only check after: 4 active jobs, 1 Vault entry, RPC callable by service_role only.
--
-- Schedule the automatic backups and repair the daily GitHub sync check.
--
-- Why: no automatic backup has ever run. The admin Backups page advertises a weekly backup
-- (Sundays 03:00 UTC) and a monthly one (the 1st, 03:30 UTC), but nothing ever created those
-- cron jobs, and backup_runs has no rows. The only copies in the backups bucket are the
-- one-off migration exports of 5-6 May 2026. The daily GitHub sync check failed every run
-- because it reads a Vault entry, backup_cron_secret, that was never created.
-- Automation register (curaosity-operations architecture/automations/): AUTO-062, AUTO-049.
--
-- What it does:
-- 1. Creates the Vault entry backup_cron_secret if it is missing. The database generates the
--    value, so nobody sees or copies it.
-- 2. Adds public.get_backup_cron_secret(), callable only by the service role. auto-backup and
--    github-sync-check read the token through it (supabase/functions/_shared/cron-secret.ts).
-- 3. Schedules, all in UTC:
--      auto-backup-weekly          0 3 * * 0     full backup, kept 30 days by default
--      auto-backup-monthly         30 3 1 * *    full backup, kept 60 days by default
--      auto-backup-process-queue   */10 * * * *  resumes a backup that has logged nothing for
--                                                15 minutes (its next step was lost)
--      github-sync-check-daily     0 14 * * *    same schedule as before; the token now
--                                                travels in a header instead of the URL
--    Existing jobs with these names are replaced, so the file can run twice safely.
--
-- Effects to expect: each full backup copies the 16 tables and the blog-images, email-assets
-- and site-videos buckets, about 950 MB on 25 Nov 2026. github-sync-check emails admin@ and
-- operations@ when the latest GitHub Actions run failed or there has been no commit for 72
-- hours, at most once every 30 minutes.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'backup_cron_secret') THEN
    PERFORM vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'backup_cron_secret',
      'Token for scheduled calls to auto-backup and github-sync-check'
    );
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.get_backup_cron_secret()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'backup_cron_secret' LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_backup_cron_secret() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_backup_cron_secret() TO service_role;

DO $$
DECLARE
  _job text;
BEGIN
  FOREACH _job IN ARRAY ARRAY[
    'auto-backup-weekly', 'auto-backup-monthly', 'auto-backup-process-queue', 'github-sync-check-daily'
  ] LOOP
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = _job) THEN
      PERFORM cron.unschedule(_job);
    END IF;
  END LOOP;
END
$$;

SELECT cron.schedule('auto-backup-weekly', '0 3 * * 0', $job$
  SELECT net.http_post(
    url := 'https://dkpxjivoupqpmvzwxpef.supabase.co/functions/v1/auto-backup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'backup_cron_secret' LIMIT 1)
    ),
    body := '{"kind":"weekly"}'::jsonb,
    timeout_milliseconds := 30000
  );
$job$);

SELECT cron.schedule('auto-backup-monthly', '30 3 1 * *', $job$
  SELECT net.http_post(
    url := 'https://dkpxjivoupqpmvzwxpef.supabase.co/functions/v1/auto-backup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'backup_cron_secret' LIMIT 1)
    ),
    body := '{"kind":"monthly"}'::jsonb,
    timeout_milliseconds := 30000
  );
$job$);

SELECT cron.schedule('auto-backup-process-queue', '*/10 * * * *', $job$
  SELECT net.http_post(
    url := 'https://dkpxjivoupqpmvzwxpef.supabase.co/functions/v1/auto-backup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'backup_cron_secret' LIMIT 1)
    ),
    body := '{"action":"process-queue"}'::jsonb,
    timeout_milliseconds := 30000
  );
$job$);

SELECT cron.schedule('github-sync-check-daily', '0 14 * * *', $job$
  SELECT net.http_post(
    url := 'https://dkpxjivoupqpmvzwxpef.supabase.co/functions/v1/github-sync-check',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-token', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'backup_cron_secret' LIMIT 1)
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
$job$);

-- Read-only confirmation, run after applying (expect 4 active jobs and the Vault entry):
--   SELECT jobname, schedule, active FROM cron.job
--    WHERE jobname IN ('auto-backup-weekly', 'auto-backup-monthly', 'auto-backup-process-queue', 'github-sync-check-daily')
--    ORDER BY jobname;
--   SELECT count(*) AS vault_entries FROM vault.secrets WHERE name = 'backup_cron_secret';
