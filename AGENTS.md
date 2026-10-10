# Project rules

- LinkedIn article reading lives only in `supabase/functions/_shared/linkedin-article.ts`; the scanner imports through `import-linkedin-article` instead of parsing pages itself. Why: two copies of the cleanup rules drifted apart and broke imports.
- `youtube_videos` and `media_appearances` use `review_status` (pending/published); RLS hides pending from the public and public queries also filter on it. Why: scanned imports must wait for admin approval.
