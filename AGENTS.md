# Project rules

- LinkedIn article reading lives only in `supabase/functions/_shared/linkedin-article.ts`; the scanner imports through `import-linkedin-article` instead of parsing pages itself. Why: two copies of the cleanup rules drifted apart and broke imports.
- `youtube_videos` and `media_appearances` use `review_status` (pending/published); RLS hides pending from the public and public queries also filter on it. Why: scanned imports must wait for admin approval.
- Media appearance structured data uses the shared `src/lib/media-appearance-seo.mjs` builder in the public page and prerender pipeline, independent of filters and page SEO overrides. Why: crawlers and browsers must receive the same approved-only summaries.
- Public media SELECT policies separate anonymous approved-only reads from authenticated reviewer checks. Why: private role-check functions must not execute for anonymous visitors.
- Resource opt-ins queue email through `_shared/resource-email.ts` with explicit server credentials and require an acknowledged queue result before returning success. Why: implicit function-client credentials can reject server-only templates silently.
