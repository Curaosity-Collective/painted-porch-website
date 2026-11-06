# Project rules

- AI features and integration health checks use server-held Lovable AI credentials, never direct Anthropic credentials. Why: one gateway owns the app's AI access and obsolete provider secrets must not be required.

- LinkedIn article reading lives only in `supabase/functions/_shared/linkedin-article.ts`; the scanner imports through `import-linkedin-article` instead of parsing pages itself. Why: two copies of the cleanup rules drifted apart and broke imports.
- `youtube_videos` and `media_appearances` use `review_status` (pending/published); RLS hides pending from the public and public queries also filter on it. Why: scanned imports must wait for admin approval.
- Media appearance structured data uses the shared `src/lib/media-appearance-seo.mjs` builder in the public page and prerender pipeline, independent of filters and page SEO overrides. Why: crawlers and browsers must receive the same approved-only summaries.
- Public SELECT policies separate anonymous published-only reads from authenticated reviewer checks. Why: private role-check functions must not execute for anonymous visitors.
- Resource opt-ins queue email through `_shared/resource-email.ts` with explicit server credentials, report queued/suppressed/failed separately, and never block immediate access on email failure. Why: optional email copies must not gate resource access or silently claim delivery.
- Individual media pages use stable record IDs and the shared media SEO builder in React and prerender, with share-sized thumbnail copies generated at publish time. Why: per-appearance metadata must agree across browsers and social crawlers without requiring new editorial fields.
