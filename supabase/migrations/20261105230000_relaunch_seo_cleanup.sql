-- Relaunch SEO cleanup (plan Phase 5, PPS Admin 2026-11-05; painted-porch-website PR #4).
--
-- page_seo holds admin overrides that win over each page's own SEO
-- (useDocumentSeo: database override > page > default). Before the relaunch:
--   * /, /about and /about/impact carried the old pages' titles, descriptions
--     and FAQs, which would replace the redesign's own on those addresses;
--   * 148 FAQ answers on 71 other pages said "every engagement begins with the
--     Blue Door, a fifteen hundred dollar strategic appraisal" or named the
--     pillars "Foundational Architecture, Operational Intelligence, and Human
--     Capacity". Both contradict PPS-DEC-0017/0018 and the Brand & Identity
--     Bible (the Pillars are Cultural Cornerstone, Operational Frame and
--     Living Ecosystem). The FAQs are published as FAQPage structured data and
--     the summaries as the ai-summary meta tag.
--
-- This migration:
--   1. keeps a full copy of every row it changes in page_seo_archive
--      (admins and editors can read it);
--   2. clears the text overrides on /, /about and /about/impact, so the
--      redesign's own titles and descriptions apply;
--   3. elsewhere, removes only the FAQ answers that make those claims, and
--      clears descriptions and summaries that mention the Blue Door, so each
--      page's own description applies.
-- The Blue Door addresses are left alone: /blue-door and /blue-door/purchase
-- only redirect, and /blue-door/success still serves existing buyers.
--
-- Afterwards, the "Bulk generate SEO + AEO" tool in /admin/pages can write
-- fresh summaries and FAQs from the updated brand context.
--
-- Tested 2026-11-05 on a copy of all 78 production rows: 74 rows archived,
-- 162 of 331 FAQ answers removed (14 of them on the three relaunched pages),
-- no other field or Blue Door row changed.
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

COMMENT ON TABLE public.page_seo_archive IS
  'page_seo rows as they were before an automated cleanup, so each change can be undone.';

-- Which rows change -----------------------------------------------------------

DROP TABLE IF EXISTS pg_temp.relaunch_seo_targets;
CREATE TEMP TABLE relaunch_seo_targets AS
SELECT p.id,
       CASE WHEN p.path IN ('/', '/about', '/about/impact')
            THEN 'Relaunch: cleared so the redesigned page''s own SEO applies (PPS Admin, 2026-11-05).'
            ELSE 'Relaunch: removed retired Blue Door and wrong pillar-name statements (PPS-DEC-0017, PPS-DEC-0018).'
       END AS reason
FROM public.page_seo p
WHERE (
        p.path IN ('/', '/about', '/about/impact')
        AND (p.title IS NOT NULL OR p.description IS NOT NULL OR p.og_title IS NOT NULL
             OR p.og_description IS NOT NULL OR p.aeo_summary IS NOT NULL
             OR coalesce(jsonb_array_length(CASE WHEN jsonb_typeof(p.aeo_faqs) = 'array' THEN p.aeo_faqs END), 0) > 0)
      )
   OR (
        p.path NOT LIKE '/blue-door%'
        AND p.path NOT IN ('/', '/about', '/about/impact')
        AND (p.aeo_faqs::text ~* '(blue door|fifteen hundred|1,500|foundational architecture|operational intelligence)'
             OR p.description ~* 'blue door'
             OR p.aeo_summary ~* '(blue door|foundational architecture|operational intelligence)')
      );

-- 1. Archive ------------------------------------------------------------------

INSERT INTO public.page_seo_archive
SELECT p.*, now(), t.reason
FROM public.page_seo p
JOIN relaunch_seo_targets t ON t.id = p.id;

-- 2. The relaunched pages -------------------------------------------------------

UPDATE public.page_seo p
SET title = NULL,
    description = NULL,
    og_title = NULL,
    og_description = NULL,
    aeo_summary = NULL,
    aeo_faqs = NULL
FROM relaunch_seo_targets t
WHERE t.id = p.id
  AND p.path IN ('/', '/about', '/about/impact');

-- 3. Everywhere else --------------------------------------------------------------

UPDATE public.page_seo p
SET aeo_faqs = (
      SELECT coalesce(jsonb_agg(f ORDER BY n), '[]'::jsonb)
      FROM jsonb_array_elements(p.aeo_faqs) WITH ORDINALITY AS e(f, n)
      WHERE f::text !~* '(blue door|fifteen hundred|1,500|foundational architecture|operational intelligence)'
    )
FROM relaunch_seo_targets t
WHERE t.id = p.id
  AND p.path NOT IN ('/', '/about', '/about/impact')
  AND jsonb_typeof(p.aeo_faqs) = 'array'
  AND p.aeo_faqs::text ~* '(blue door|fifteen hundred|1,500|foundational architecture|operational intelligence)';

UPDATE public.page_seo p
SET description = NULL
FROM relaunch_seo_targets t
WHERE t.id = p.id
  AND p.path NOT IN ('/', '/about', '/about/impact')
  AND p.description ~* 'blue door';

UPDATE public.page_seo p
SET aeo_summary = NULL
FROM relaunch_seo_targets t
WHERE t.id = p.id
  AND p.path NOT IN ('/', '/about', '/about/impact')
  AND p.aeo_summary ~* '(blue door|foundational architecture|operational intelligence)';

DROP TABLE IF EXISTS pg_temp.relaunch_seo_targets;
