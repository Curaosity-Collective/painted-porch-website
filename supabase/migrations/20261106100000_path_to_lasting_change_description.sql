-- Status: Applied via Lovable; confirmed live through the public API on 2026-11-09 (PPS-DEC-0029).
--
-- Remove an internal catalog note from The P.A.T.H. to Lasting Change
-- (PPS Admin, 2026-11-06).
--
-- The topic's description ended with a note copied in from the Ops Hub
-- catalog: "**Distinction from Architect Change (#32)**: This is a framework
-- teaching engagement ... Architect Change is the deep strategic co-design
-- intensive — the first engagement in a longer AMPLIFY/EMBODY partnership."
-- It showed on /speaking/topics with its Markdown asterisks and catalog number,
-- and it describes Architect Change as a standalone engagement, which it no
-- longer is (it's the workshop inside Architect ShIFt).
--
-- This keeps everything before the note, which ends "...against participants'
-- real organizational contexts." Checked 2026-11-06 against the live rows:
-- pathToLastingChange and the-p-a-t-h-to-navigating-change both go from 776
-- to 461 characters. (The second row is a duplicate that
-- 20261105210000_topics_catalogue_cleanup.sql archives and removes.)
--
-- Idempotent: a second run matches nothing.

UPDATE public.path_finder_offerings
SET description = rtrim(regexp_replace(description, '\s*\*\*Distinction from Architect Change[^*]*\*\*:.*$', ''))
WHERE description ~ '\*\*Distinction from Architect Change';
