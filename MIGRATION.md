# Migration Runbook: Lovable Cloud → Standalone Supabase

This is your escape hatch. Even if you never use it, having it written down
removes the "what if this happens again" anxiety.

**Audience:** You (Amy), or any future dev. Plain English, every command spelled out.

> **25 Nov 2026:** the one-click move tools from May 2026 (Migrate, Restore Wizard,
> Integrity Check, Secrets Handoff, Migration Checklist, and the `migrate-import` /
> `migrate-export` functions) were removed from the admin area. PPS Admin: "Yes, remove
> them in one PR". This manual runbook is now the recovery path. If you ever want the old
> tools back, they are in git history: `main` at `2d47a60a` is the last commit that has them.
> The integration checks from Secrets Handoff moved to `/admin/integrations`.

---

## What you're keeping vs. rebuilding

| Thing | Status in migration |
|---|---|
| Database tables + rows | ✅ In every backup; "Prepare restore zip" on `/admin/backups` bundles them as `json/<table>.json` |
| Storage files (blog images, videos, email assets) | ⚠️ Each full backup copies them into its folder in the private `backups` bucket (`<backup folder>/storage/<bucket>/...`). The downloadable restore zip lists them (`storage-manifest.json`) but leaves the files out |
| Auth users (passwords) | ❌ Cannot be exported. Team gets re-invited. |
| Edge Functions code | ✅ Already in repo (`supabase/functions/`) — redeploys cleanly |
| RLS policies + DB functions | ✅ Already in repo (`supabase/migrations/`) — runs cleanly on a fresh project |
| Edge Function secrets | ⚠️ Re-entered manually (you have the values; list below) |
| Cloud auth email templates | ⚠️ Reconfigured in new project's Auth dashboard (templates live in `supabase/functions/auth-email-hook/`) |

**Bottom line:** the code, schema, and data are portable. Only auth passwords
and a handful of secrets need human re-entry.

---

## Phase 0 — Before you start (do this once, today)

1. Go to `/admin/backups`, click **Run Backup Now** (backups also run on their own every
   Sunday and on the 1st of each month).
2. Click **Prepare restore zip**, then save the `.zip` somewhere safe.
3. Open the zip and confirm you see `json/`, `auth-users.json`, `lovable-snapshot.json`,
   `storage-manifest.json`, `schema.sql`, `config.sql`, `auth-config.md`,
   `secrets-checklist.md` and `README.txt`.

That's it. You now have a recoverable copy. You can stop here.

---

## Getting the code: Option A vs. Option B

The backup zip holds your **data**. To rebuild, you also need the **code**
(React app, edge functions, SQL migrations). There are two ways to get it.

### Option A - Clone the GitHub repo (recommended)

Best when: you want a live, version-controlled copy you can keep editing.

1. In Lovable: **Connectors** (sidebar) → **GitHub** → **Connect project**.
   This pushes the current codebase to a repo under your GitHub account.
2. On your laptop:
   ```bash
   git clone https://github.com/<your-account>/<repo-name>.git
   cd <repo-name>
   ```
3. You now have everything: `src/`, `supabase/migrations/`, `supabase/functions/`,
   `package.json`, configs. Every later phase assumes you have this.

Why this is recommended:
- Two-way sync stays live; future Lovable edits keep flowing in.
- `git pull` brings updates without re-downloading.
- Branches and history are preserved.

### Option B - Download ZIP from GitHub

Best when: you just want a one-time snapshot of the code, no Git workflow.

1. Connect to GitHub the same way (Step 1 above).
2. Open the GitHub repo in your browser → green **Code** button → **Download ZIP**.
3. Unzip it locally. Same folders as Option A, just no `.git` history.

Trade-offs:
- No sync. Future Lovable changes won't appear unless you re-download.
- No `git pull`, no branches.
- Fine for "I just need the files to migrate once" scenarios.

### Which gives you what

| Source | Contents |
|---|---|
| **GitHub repo (A or B)** | All source code, edge function code, SQL migrations, configs |
| **Backup zip (`/admin/backups`)** | Database rows (CSV+JSON), storage binaries, snapshot, schema diagram |

You need **both** to fully rebuild. Repo = code + schema. Zip = data + files.

---

## Phase 1 — Stand up a new Supabase project (~30 min)

1. Go to https://supabase.com → create account (use the email you want to own this).
2. Create a new project. Pick a region near your users (US East is fine).
3. Save the **project ref** (the string in the URL like `abcdxyz`) and the **service_role key** (Settings → API). You'll need both.
4. Install the Supabase CLI locally if you don't have it:
   ```bash
   brew install supabase/tap/supabase
   supabase login
   ```

---

## Phase 2 — Push the schema (~15 min)

The repo already contains every migration that built the current database.
You just point the CLI at the new project and run them.

```bash
cd /path/to/this/repo
supabase link --project-ref <NEW_PROJECT_REF>
supabase db push
```

This creates every table, RLS policy, function, trigger, and the
`pgmq` / `pg_cron` extensions used by the email queue. No manual SQL needed.

If `db push` complains about `pgmq` or `pg_cron`, enable them once in the
Supabase Dashboard → Database → Extensions, then re-run.

Note: some of the site's database changes live in `drizzle/migrations/` (Lovable's own
folder, PPS-DEC-0029), which `supabase db push` does not run. Whether the two folders
together rebuild the full schema has not been tested `[TBD]`. The restore zip's `schema.sql`
is a dump of the live schema taken at backup time; run it in the SQL editor if `db push`
leaves tables or functions missing.

---

## Phase 3 — Restore your data (~30 min)

From the backup zip:

```bash
unzip pps-backup-manual-*.zip -d backup/
```

Each table is in the zip as `json/<table>.json`. The zip has no CSV files, so either
convert each JSON file to CSV first and use Supabase Dashboard → Table Editor → pick table
→ "Insert" → "Import data from CSV", or load the JSON with a short script. No tested
import script exists in this repo `[GAP]`.

If you have converted to CSV, `psql` is faster for big tables:

```bash
export PGURL="postgresql://postgres:<DB_PASSWORD>@db.<NEW_REF>.supabase.co:5432/postgres"

for t in profiles blog_categories blog_posts blog_post_categories \
         media_appearances media_appearance_categories \
         youtube_videos youtube_video_categories \
         site_video_slots site_videos page_status \
         access_tokens suppressed_emails email_unsubscribe_tokens; do
  psql "$PGURL" -c "\copy public.$t FROM 'backup/csv/$t.csv' WITH CSV HEADER"
done
```

(Skip `email_send_log` and `email_send_state` — those are runtime tables and
will repopulate on their own.)

---

## Phase 4 — Re-upload storage files (~1 hr, mostly waiting)

The restore zip contains a **manifest** (`storage-manifest.json`) listing every
file in every bucket — names, sizes, paths — but **not the files themselves**
(about 950 MB on 25 Nov 2026). Each full backup also copies the files into its
folder in the private `backups` bucket, under `storage/<bucket>/...`; download them
from there while the old project is still reachable.

Then re-upload them:

1. In the new Supabase Dashboard → Storage, create the four buckets:
   - `blog-images` (public)
   - `email-assets` (public)
   - `site-videos` (public)
   - `backups` (private)
2. For blog images: re-upload from your local copies, or use the manifest
   to fetch each file from the OLD project's public URL and re-upload to
   the new one. A 10-line Node script can do this in batch — ask Lovable
   for help if needed.
3. For site videos: same approach. The `/admin/videos` page lets you
   re-add them via "Migrate from URL" once the new project is connected.
4. Run the checks on `/admin/integrations` once the secrets in Phase 5 are in.

---

## Phase 5 — Set Edge Function secrets (~10 min)

In the new Supabase Dashboard → Edge Functions → Manage secrets, add these
(values you already have — copy them from the current Cloud project, or
from your password manager / GHL / Stripe dashboards):

```
GHL_API_KEY
GHL_LOCATION_ID
YOUTUBE_API_KEY
RESEND_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
FIRECRAWL_API_KEY
ADMIN_NOTIFICATION_EMAIL
BACKUP_CRON_SECRET     # generate a fresh random string, update pg_cron job to match
LOVABLE_API_KEY        # used by Lovable AI and connected services
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`SUPABASE_JWKS`, `SUPABASE_DB_URL` are auto-injected by Supabase — don't
set them manually.

---

## Phase 6 — Deploy Edge Functions (~5 min)

```bash
supabase functions deploy --project-ref <NEW_PROJECT_REF>
```

This pushes every function in `supabase/functions/` to the new project.

---

## Phase 7 — Point the frontend at the new project (~5 min)

1. Update `.env` (or the equivalent in your hosting):
   ```
   VITE_SUPABASE_URL=https://<NEW_REF>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<new anon key>
   VITE_SUPABASE_PROJECT_ID=<NEW_REF>
   ```
2. Rebuild and redeploy the site (Vercel / Netlify / wherever).
3. Smoke test: load `/`, log into `/admin`, check `/resources/blog`.

---

## Phase 8 — Re-invite the team (~15 min)

Go to `/admin/users` and re-invite each teammate. They'll receive a fresh
sign-up link from the new project. Their roles need to be re-set in the
`profiles` table (already restored in Phase 3, so this is mostly automatic
once they sign up with the same email).

---

## Phase 9 — Reconfigure auth email templates (~10 min)

In the new Supabase Dashboard → Authentication → Email Templates, paste the
HTML from `supabase/functions/_shared/email-templates/` for:
- Confirm signup
- Magic link
- Invite user
- Reset password
- Change email
- Reauthentication

Or, if you keep the `auth-email-hook` Edge Function (already in repo), point
the Auth webhook at it and the templates serve themselves.

---

## Phase 10 — Final cutover (~5 min)

1. Update GHL webhooks, Stripe webhook URLs, and any external integrations
   to point at the new project's edge function URLs.
2. Update the custom domain DNS if applicable.
3. Disable the old Lovable Cloud project (or leave it read-only as a backup
   for 30 days).

### Status of the May 2026 move's old project (26 Nov 2026)

Step 3 was not done in May. The old project, "(OLD) Painted Porch Strategies"
in Lovable (backend `kzbcudiorvnsqqgyzusl`), is unpublished, but its backend
was still live on 26 Nov 2026. It held 4 login accounts and 92 blog posts, and
three scheduled jobs were still running on it.

- **Done 26 Nov 2026:** its three scheduled jobs were switched off
  (`cron.alter_job(..., active := false)`). The jobs are still defined, and
  nothing else changed. PPS Admin: "Yes, switch them off".

  | Job id | Name | Schedule (UTC) |
  |---|---|---|
  | 2 | `daily-scan-linkedin-articles` | `0 9 * * *` |
  | 7 | `auto-backup-weekly` | `0 3 * * 0` |
  | 8 | `auto-backup-monthly` | `30 3 1 * *` |

  To undo: `select cron.alter_job(job_id := <id>, active := true);` on that project.
- **Not done yet `[TBD]`:** pausing or deleting the old project, and rotating
  the API keys it may still hold (Stripe, GHL, Firecrawl and others). Wait
  until the live site's first scheduled backup succeeds (the weekly run, first
  due Sunday 29 Nov 2026, 03:00 UTC). Until then, the May exports in the live
  site's `backups` bucket (about 760 MB from 5–6 May) are its only full
  backup, so keep them.

---

## Estimated total time: 3-4 hours of focused work

Most of it is waiting for uploads. The actual decision-making is minimal
because every command is spelled out above.

## If you get stuck

- Schema push fails → enable extensions manually in Dashboard, retry
- Data import fails on one table → import that table via Dashboard UI
- Edge function won't deploy → check `supabase/config.toml` for missing
  function-specific blocks
- Auth users can't log in → confirm `profiles` table populated, then
  re-invite

The whole point of this runbook is that you can hand it to anyone (or
future-you at 11pm) and they can execute it without re-deriving the steps.
