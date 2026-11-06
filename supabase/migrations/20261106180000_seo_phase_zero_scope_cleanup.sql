-- Stored SEO text that says Phase Zero sits inside the Prepare stage (PPS Admin, 2026-11-06;
-- PPS-DEC-0027: "Phase zero is NOT just prepare. It's prepare and align").
--
-- The SEO generator's brand context described Phase Zero as "inside Prepare", and
-- "Bulk generate SEO + AEO" repeated it. Checked against production on 2026-11-06 at
-- 17:0x UTC, the wrong claims are on:
--   * /phase-zero: the description ("Master the Prepare stage of change with Phase Zero"),
--     the summary ("the strategic authorship stage within the Prepare phase") and two FAQ
--     answers, one saying "Once Phase Zero is complete within the Prepare stage, leaders move
--     into the Align stage";
--   * /capabilities, /change-roadmap, /contact, /thank-you-change-canvas and
--     /eq-change-leader: one FAQ answer each ("happens during/within the Prepare stage",
--     "The first step is the Prepare stage, which features Phase Zero").
-- Sentences that only say Phase Zero comes "before implementation", or that teams get
-- "prepared", are correct and are left alone.
-- The generator's brand context now says Phase Zero spans Prepare and Align
-- (generate-page-seo, same pull request), so a later "Bulk generate" refills these.
--
-- This migration:
--   1. keeps a full copy of every row it changes in page_seo_archive (created by
--      20261106170000 if it doesn't exist yet);
--   2. removes only the FAQ answers and keywords, and clears only the titles, descriptions
--      and summaries, that place Phase Zero inside the Prepare stage.
--
-- Tested 2026-11-06 on a copy of all 86 production rows, after 20261106170000: 6 rows
-- archived, 7 FAQ answers removed, 1 description and 1 summary cleared, no other column
-- changed; a second run changes nothing.

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

-- "Phase Zero … within/during/inside/in the Prepare stage/phase", or
-- "… the Prepare stage … Phase Zero" in the same sentence.
DROP TABLE IF EXISTS pg_temp.seo_phase_zero_pattern;
CREATE TEMP TABLE seo_phase_zero_pattern AS
SELECT '(phase zero[^.]{0,120}\m(within|during|inside|in) the prepare (stage|phase)|prepare stage[^.]{0,80}phase zero)'::text AS re;

-- Which rows change -----------------------------------------------------------

DROP TABLE IF EXISTS pg_temp.seo_phase_zero_targets;
CREATE TEMP TABLE seo_phase_zero_targets AS
SELECT p.id
FROM public.page_seo p, seo_phase_zero_pattern x
WHERE concat_ws(' ', p.title, p.description, p.og_title, p.og_description, p.aeo_summary,
                array_to_string(p.keywords, ' '), p.aeo_faqs::text) ~* x.re;

-- 1. Archive ------------------------------------------------------------------

INSERT INTO public.page_seo_archive
SELECT p.*, now(),
       'Generated SEO text placed Phase Zero inside the Prepare stage; it spans Prepare and Align (PPS-DEC-0027, PPS Admin 2026-11-06).'
FROM public.page_seo p
JOIN seo_phase_zero_targets t ON t.id = p.id;

-- 2. Remove the wrong claims ------------------------------------------------------

UPDATE public.page_seo p
SET title          = CASE WHEN p.title          ~* x.re THEN NULL ELSE p.title END,
    description    = CASE WHEN p.description    ~* x.re THEN NULL ELSE p.description END,
    og_title       = CASE WHEN p.og_title       ~* x.re THEN NULL ELSE p.og_title END,
    og_description = CASE WHEN p.og_description ~* x.re THEN NULL ELSE p.og_description END,
    aeo_summary    = CASE WHEN p.aeo_summary    ~* x.re THEN NULL ELSE p.aeo_summary END,
    keywords = CASE
      WHEN p.keywords IS NULL THEN NULL
      ELSE ARRAY(SELECT k FROM unnest(p.keywords) WITH ORDINALITY AS u(k, n) WHERE k !~* x.re ORDER BY n)
    END,
    aeo_faqs = CASE
      WHEN jsonb_typeof(p.aeo_faqs) = 'array' THEN (
        SELECT coalesce(jsonb_agg(f ORDER BY n), '[]'::jsonb)
        FROM jsonb_array_elements(p.aeo_faqs) WITH ORDINALITY AS e(f, n)
        WHERE f::text !~* x.re)
      ELSE p.aeo_faqs
    END
FROM seo_phase_zero_targets t, seo_phase_zero_pattern x
WHERE t.id = p.id;

DROP TABLE IF EXISTS pg_temp.seo_phase_zero_targets;
DROP TABLE IF EXISTS pg_temp.seo_phase_zero_pattern;
