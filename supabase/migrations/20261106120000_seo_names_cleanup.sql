-- Stored SEO text: wrong speaker surnames and the retired partnership-style names
-- (PPS Admin, 2026-11-06; painted-porch-website PR #8; PPS-DEC-0025).
--
-- page_seo overrides win over each page's own SEO (useDocumentSeo: database override >
-- page > default), and their FAQs and summaries are published as FAQPage structured data
-- and the ai-summary meta tag. Checked against production on 2026-11-06:
--   * Earlier AI-generated overrides gave the speakers invented surnames: "Amy Rowlinson"
--     (/amy), "Amy Wood" (/speaking/amy), "Rob Katchur" (/speaking/rob), "Sierra Modro"
--     (/speaking/sierra), "Amy Leniet" (a /speaking/media keyword), and titled Sierra's
--     page "The Sierra Workshop". The speakers are Amy Yackowski, Rob Hunter and Sierra
--     Cantrell.
--   * 6 titles, 10 descriptions, 7 social titles, 9 social descriptions, 12 summaries,
--     12 keyword lists and 21 FAQ sets still name IGNITE, AMPLIFY or EMBODY, which
--     PPS-DEC-0025 retires from the public site.
--
-- This migration:
--   1. keeps a full copy of every row it changes in page_seo_archive;
--   2. on a row that names a speaker wrongly, clears every text override, so the page's
--      own SEO applies;
--   3. elsewhere, clears the title, description, social text and summary that name
--      IGNITE, AMPLIFY or EMBODY, and removes only the FAQ answers and keywords that do.
-- In body text the names are matched in capitals only, so ordinary words ("ignite your
-- team", "embody the change") are left alone. Titles also lose "Ignite" or "Amplify" in
-- any case: there they're puns on the old names (for example "Leadership Masterclasses:
-- Ignite Your Change Strategy"). "Embody ShIFt" is a current offer and stays.
--
-- Tested 2026-11-06 on a copy of all 85 production rows, after the relaunch cleanup:
-- 28 rows archived (6 wrong names, 22 retired names), 66 of 322 FAQ answers removed,
-- 13 titles cleared, no other column changed; a second run changes nothing.
--
-- Afterwards, "Bulk generate SEO + AEO" in /admin/pages can write fresh text; its brand
-- context now names the speakers and forbids the retired names.
--
-- Idempotent: a second run finds nothing left to change and archives nothing.

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

-- Which rows change -----------------------------------------------------------

DROP TABLE IF EXISTS pg_temp.seo_names_targets;
CREATE TEMP TABLE seo_names_targets AS
SELECT p.id,
       (to_jsonb(p)::text ~ '(Amy (Rowlinson|Wood|Leniet)|Rob Katchur|Sierra Modro|The Sierra Workshop)') AS wrong_name
FROM public.page_seo p
WHERE to_jsonb(p)::text ~ '(Amy (Rowlinson|Wood|Leniet)|Rob Katchur|Sierra Modro|The Sierra Workshop)'
   OR concat_ws(' ', p.title, p.description, p.og_title, p.og_description, p.aeo_summary,
                array_to_string(p.keywords, ' '), p.aeo_faqs::text) ~ '\m(IGNITE|AMPLIFY|EMBODY)\M'
   OR concat_ws(' ', p.title, p.og_title) ~* '\m(ignite|amplify)\M';

-- 1. Archive ------------------------------------------------------------------

INSERT INTO public.page_seo_archive
SELECT p.*, now(),
       CASE WHEN t.wrong_name
            THEN 'Wrong speaker surname in generated SEO text; cleared so the page''s own SEO applies (PPS Admin, 2026-11-06).'
            ELSE 'Removed the retired names IGNITE, AMPLIFY and EMBODY (PPS-DEC-0025).'
       END
FROM public.page_seo p
JOIN seo_names_targets t ON t.id = p.id;

-- 2. Wrong speaker names: clear the row's text overrides ------------------------

UPDATE public.page_seo p
SET title = NULL,
    description = NULL,
    og_title = NULL,
    og_description = NULL,
    aeo_summary = NULL,
    aeo_faqs = NULL,
    keywords = NULL
FROM seo_names_targets t
WHERE t.id = p.id
  AND t.wrong_name;

-- 3. Retired names elsewhere ----------------------------------------------------

UPDATE public.page_seo p
SET title          = CASE WHEN p.title          ~ '\m(IGNITE|AMPLIFY|EMBODY)\M' OR p.title ~* '\m(ignite|amplify)\M' THEN NULL ELSE p.title END,
    description    = CASE WHEN p.description    ~ '\m(IGNITE|AMPLIFY|EMBODY)\M' THEN NULL ELSE p.description END,
    og_title       = CASE WHEN p.og_title       ~ '\m(IGNITE|AMPLIFY|EMBODY)\M' OR p.og_title ~* '\m(ignite|amplify)\M' THEN NULL ELSE p.og_title END,
    og_description = CASE WHEN p.og_description ~ '\m(IGNITE|AMPLIFY|EMBODY)\M' THEN NULL ELSE p.og_description END,
    aeo_summary    = CASE WHEN p.aeo_summary    ~ '\m(IGNITE|AMPLIFY|EMBODY)\M' THEN NULL ELSE p.aeo_summary END,
    keywords = CASE
      WHEN p.keywords IS NULL THEN NULL
      ELSE ARRAY(SELECT k FROM unnest(p.keywords) WITH ORDINALITY AS u(k, n)
                 WHERE k !~ '\m(IGNITE|AMPLIFY|EMBODY)\M' ORDER BY n)
    END,
    aeo_faqs = CASE
      WHEN jsonb_typeof(p.aeo_faqs) = 'array' THEN (
        SELECT coalesce(jsonb_agg(f ORDER BY n), '[]'::jsonb)
        FROM jsonb_array_elements(p.aeo_faqs) WITH ORDINALITY AS e(f, n)
        WHERE f::text !~ '\m(IGNITE|AMPLIFY|EMBODY)\M')
      ELSE p.aeo_faqs
    END
FROM seo_names_targets t
WHERE t.id = p.id
  AND NOT t.wrong_name;

DROP TABLE IF EXISTS pg_temp.seo_names_targets;
