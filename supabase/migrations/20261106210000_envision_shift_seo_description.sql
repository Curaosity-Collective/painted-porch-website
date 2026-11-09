-- Status: Applied 2026-11-09 06:15 UTC via Lovable; confirmed live through the public API on 2026-11-09 (PPS-DEC-0029).
--
-- Envision ShIFt search and link-preview description: PPS Admin's own text (2026-11-06).
--
-- /envision-shift carries its description in src/pages/pps/v3/EnvisionShift.tsx: the text
-- PPS Admin chose on 2026-11-03 for the redesign, ending "...what in your organization needs
-- reinforcement first, so you can lead with clarity and build with confidence. Investment:
-- $24,000." A page_seo row overrides it (useDocumentSeo: database override > page > default),
-- so browsers and crawlers that run scripts got a generated text instead. Read through the
-- public API on 2026-11-06 at about 20:35 UTC, the row (last updated 20:02 UTC) had:
--   description:    "Partner with Painted Porch Strategies for an interview-led organizational
--                    360. Get your P.A.T.H. Compass and start Phase Zero with Envision ShIFt."
--   og_description: "Architect your change strategy with an interview-led organizational 360.
--                    Discover the P.A.T.H. Compass through Envision ShIFt."
-- PPS Admin approved restoring her text on 2026-11-06.
--
-- This migration:
--   1. keeps a full copy of the row in page_seo_archive before changing it;
--   2. sets description and og_description to the page's own text. Clearing them instead
--      would let the next "Bulk generate SEO + AEO" fill them again; a set value is kept
--      unless someone runs it with "Overwrite pages that already have SEO".
-- Title, OG title, keywords, summary and FAQs are left as they are.
--
-- Idempotent: once the row holds the text, a second run archives and changes nothing.

CREATE TABLE IF NOT EXISTS public.page_seo_archive (
  LIKE public.page_seo INCLUDING DEFAULTS,
  archived_at timestamptz NOT NULL DEFAULT now(),
  archived_reason text NOT NULL
);

ALTER TABLE public.page_seo_archive ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and editors can read archived page SEO" ON public.page_seo_archive;
CREATE POLICY "Admins and editors can read archived page SEO"
  ON public.page_seo_archive FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

DROP TABLE IF EXISTS pg_temp.envision_shift_description;
CREATE TEMP TABLE envision_shift_description AS
SELECT 'An interview-led organizational 360 built on six interviews, from executives to the frontline. Your P.A.T.H. Compass clarifies which change and direction make sense to pursue NOW and what in your organization needs reinforcement first, so you can lead with clarity and build with confidence. Investment: $24,000.'::text AS txt;

-- 1. Archive ------------------------------------------------------------------

INSERT INTO public.page_seo_archive
SELECT p.*, now(),
       'Generated description replaced by the page''s own text, chosen by PPS Admin (2026-11-03; restore approved 2026-11-06).'
FROM public.page_seo p, envision_shift_description d
WHERE p.path = '/envision-shift'
  AND (p.description IS DISTINCT FROM d.txt OR p.og_description IS DISTINCT FROM d.txt);

-- 2. Set the description ------------------------------------------------------

UPDATE public.page_seo p
SET description    = d.txt,
    og_description = d.txt
FROM envision_shift_description d
WHERE p.path = '/envision-shift'
  AND (p.description IS DISTINCT FROM d.txt OR p.og_description IS DISTINCT FROM d.txt);
