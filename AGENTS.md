# Project rules

- LinkedIn article reading lives only in `supabase/functions/_shared/linkedin-article.ts`; the scanner imports through `import-linkedin-article` instead of parsing pages itself. Why: two copies of the cleanup rules drifted apart and broke imports.
- `youtube_videos` and `media_appearances` use `review_status` (pending/published); RLS hides pending from the public and public queries also filter on it. Why: scanned imports must wait for admin approval.

## PPS skill routing

- Load the managed `speaking-event-engagement` skill before building or changing an attendee continuation experience around an approved keynote, workshop, webinar, or conference session. This includes event landing pages, QR/short-URL bridges, routing guides, inquiry or booking states, attendee data capture, event emails, and event closure/reconciliation work.
- Read [`docs/skills/speaking-event-engagement.md`](docs/skills/speaking-event-engagement.md) for the repository-specific trigger, companion skills, implementation controls, and PR checklist.
- Do not infer a new event’s route, access method, investment, qualification logic, provider configuration, or closure behavior from an earlier event. The approved Event Engagement Brief is the event-level authority.
- For event work, use the required companion PPS skills named in the repository record—especially `porch-voice-standards`, `porch-visual-brand`, `porch-web-design`, and `porch-offerings-catalog`—before finalizing attendee-facing work.
