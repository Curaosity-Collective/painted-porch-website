-- Status: Pending
--
-- Ten live pages: search and link-preview titles and descriptions are written to each page's own
-- text (PPS Admin, 2026-11-09: "Apply the same SEO text-to-page fix to every page's title,
-- description and og tags, so each page's metadata matches its own approved copy", then "Yes write
-- group A"; PPS-DEC-0029). Supersedes 20261109070000_relaunch_pages_own_seo.sql, which never ran
-- and is removed in the same change; its three pages are included here.
--
-- Pages: /, /about, /about/impact, /architect-shift, /elemental-style-assessment, /embody-shift, /envision-shift, /phase-zero, /press-kit, /the-path.
-- These are the live pages whose own text, read from the page with database text switched off,
-- agrees with scripts/prerender-content.mjs or is the only version. Draft pages, pages that
-- redirect, and pages with no text of their own are left alone.
--
-- At 06:32:50 UTC on 2026-11-09 a Lovable operation emptied title, description, og_title and
-- og_description on 54 rows, nine of these among them (archived first, reason "Generated metadata
-- replaced by approved page-authored defaults ..."). Visitors already get each page's own text
-- from the code fallback (useDocumentSeo: database override > page > default); writing it in keeps
-- the next "Bulk generate SEO + AEO" from filling the fields again, unless it is run with
-- "Overwrite pages that already have SEO". /envision-shift already holds its text: no change there.
--
-- This migration:
--   1. keeps a full copy of each row it changes in page_seo_archive;
--   2. sets title and og_title to the page's own title, and description and og_description to its
--      own description.
-- og_image, the AI summary, FAQs, keywords and every other row are left as they are. If a page's
-- own title or description changes in code later, its row has to change with it.
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

DROP TABLE IF EXISTS pg_temp.live_pages_own_seo;
CREATE TEMP TABLE live_pages_own_seo (path text PRIMARY KEY, title text NOT NULL, description text NOT NULL);
INSERT INTO live_pages_own_seo (path, title, description) VALUES
  ('/',
   $q$Painted Porch Strategies | Build an Organization That Can Do Epic ShIFt$q$,
   $q$You have a vision for who your organization can become next. Is that future being authored with intention, or inherited through assumption?$q$),
  ('/about',
   $q$About | Painted Porch Strategies$q$,
   $q$Named for the Stoa Poikile, the painted porch where philosophy went public. Twenty-plus years of organizational change, practiced at the decision, not the delivery.$q$),
  ('/about/impact',
   $q$Results & Impact | Painted Porch Strategies$q$,
   $q$What our clients say, the organizations we've worked alongside, and where 5% of every fee has gone: $31,474 given to client-chosen charities to date.$q$),
  ('/architect-shift',
   $q$Architect ShIFt | Painted Porch Strategies$q$,
   $q$An executive strategy & authorship intensive, a 90-day pillar-fortification sprint and a retrospective that decides your organization's next step. Starting at $90,000, in a weekly or a biweekly version.$q$),
  ('/elemental-style-assessment',
   $q$Your Elemental Style: Free Assessment | Painted Porch Strategies$q$,
   $q$A free five-minute quiz on your natural communication and collaboration style: how you show up, where you shine, and how you connect best with others. No sign-up.$q$),
  ('/embody-shift',
   $q$Embody ShIFt | Painted Porch Strategies$q$,
   $q$Ongoing advisory while your organization designs and leads the change it envisioned and authored, reinforcing it as a continuous practice. $9,000–$18,000 per month, depending on advisory depth and need.$q$),
  ('/envision-shift',
   $q$The Epic ShIFt Organizational Appraisal | Painted Porch Strategies$q$,
   $q$An interview-led organizational 360 built on six interviews, from executives to the frontline. Your P.A.T.H. Compass clarifies which change and direction make sense to pursue NOW and what in your organization needs reinforcement first, so you can lead with clarity and build with confidence. Investment: $24,000.$q$),
  ('/phase-zero',
   $q$Phase Zero™: Our Approach | Painted Porch Strategies$q$,
   $q$Phase Zero is the work before the work: the Prepare and Align stages of the P.A.T.H., where leaders get clear about people, systems, and culture, and decide what to author before the next big shIFt.$q$),
  ('/press-kit',
   $q$Press Kit & Speaker Bios | Painted Porch Strategies$q$,
   $q$Explore Painted Porch Strategies speaker bios, mission, media appearances and speaking engagements. Download the press kit or contact Media Relations.$q$),
  ('/the-path',
   $q$The P.A.T.H.™ | Painted Porch Strategies$q$,
   $q$Prepare, Align, Take Off, Create Habits: the four stages of change behind every Painted Porch engagement, and how Envision, Architect and Embody ShIFt partner on each.$q$);

-- 1. Archive ------------------------------------------------------------------

INSERT INTO public.page_seo_archive
SELECT p.*, now(),
       'Page title and description written from the page''s own text, group A (PPS Admin, 2026-11-09; 20261109163000).'
FROM public.page_seo p
JOIN live_pages_own_seo s ON s.path = p.path
WHERE (p.title, p.og_title, p.description, p.og_description)
      IS DISTINCT FROM (s.title, s.title, s.description, s.description);

-- 2. Write the page's own text ------------------------------------------------

UPDATE public.page_seo p
SET title          = s.title,
    og_title       = s.title,
    description    = s.description,
    og_description = s.description
FROM live_pages_own_seo s
WHERE s.path = p.path
  AND (p.title, p.og_title, p.description, p.og_description)
      IS DISTINCT FROM (s.title, s.title, s.description, s.description);
