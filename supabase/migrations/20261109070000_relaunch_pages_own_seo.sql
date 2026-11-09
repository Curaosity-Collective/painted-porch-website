-- Status: Pending
--
-- /, /about and /about/impact: search and link-preview titles and descriptions go back to each
-- page's own text (PPS Admin, 2026-11-09: "yes, restore the redesign's own titles"; PPS-DEC-0029).
--
-- 20261105230000_relaunch_seo_cleanup cleared these three page_seo rows so the redesign's own
-- titles and descriptions would apply (useDocumentSeo: database override > page > default).
-- "Bulk generate SEO + AEO" filled them again between 19:59 and 20:00 UTC on 2026-11-06 (Lovable
-- commit 3b7b5c5c, "Applied SEO cleanup & bulk gen"), so browsers and crawlers that run scripts
-- got generated titles such as "Organizational Change Consultancy: Painted Porch Strategies". The prerendered
-- pages (scripts/prerender-content.mjs) were never affected: they use the pages' own text.
--
-- This migration:
--   1. keeps a full copy of each row it changes in page_seo_archive;
--   2. sets title and og_title to the page's own title, and description and og_description to
--      the page's own description, as written in src/pages/pps/v3/HomeNext.tsx, AboutNext.tsx
--      and ResultsImpact.tsx. Setting the text rather than clearing it means the next
--      "Bulk generate SEO + AEO" keeps it, unless someone runs it with "Overwrite pages that
--      already have SEO".
-- The AI summary, FAQs and keywords are left as they are: the 2026-11-05 cleanup expected the
-- bulk tool to write those afresh. If a page's own title or description changes in code later,
-- this row has to change with it, or the database text keeps winning.
--
-- Idempotent: once the rows hold the text, a second run archives and changes nothing.

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

DROP TABLE IF EXISTS pg_temp.relaunch_pages_own_seo;
CREATE TEMP TABLE relaunch_pages_own_seo (path text PRIMARY KEY, title text NOT NULL, description text NOT NULL);
INSERT INTO relaunch_pages_own_seo (path, title, description) VALUES
  ('/',
   $t$Painted Porch Strategies | Build an Organization That Can Do Epic ShIFt$t$,
   $d$You have a vision for who your organization can become next. Is that future being authored with intention, or inherited through assumption?$d$),
  ('/about',
   $t$About | Painted Porch Strategies$t$,
   $d$Named for the Stoa Poikile, the painted porch where philosophy went public. Twenty-plus years of organizational change, practiced at the decision, not the delivery.$d$),
  ('/about/impact',
   $t$Results & Impact | Painted Porch Strategies$t$,
   $d$What our clients say, the organizations we've worked alongside, and where 5% of every fee has gone: $31,474 given to client-chosen charities to date.$d$);

-- 1. Archive ------------------------------------------------------------------

INSERT INTO public.page_seo_archive
SELECT p.*, now(),
       'Generated title and description replaced by the page''s own text (PPS Admin, 2026-11-09).'
FROM public.page_seo p
JOIN relaunch_pages_own_seo s ON s.path = p.path
WHERE (p.title, p.og_title, p.description, p.og_description)
      IS DISTINCT FROM (s.title, s.title, s.description, s.description);

-- 2. Set the page's own text --------------------------------------------------

UPDATE public.page_seo p
SET title          = s.title,
    og_title       = s.title,
    description    = s.description,
    og_description = s.description
FROM relaunch_pages_own_seo s
WHERE s.path = p.path
  AND (p.title, p.og_title, p.description, p.og_description)
      IS DISTINCT FROM (s.title, s.title, s.description, s.description);
