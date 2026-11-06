-- Stored SEO text that talks about retired programs (PPS Admin, 2026-11-06; PPS-DEC-0025).
--
-- After the earlier cleanups ran, "Bulk generate SEO + AEO" refilled summaries and FAQs.
-- Its brand context then named the retired programs to forbid them, and the model repeated
-- them as news. Checked against production on 2026-11-06 at 16:1x UTC:
--   * 5 FAQ answers say "The Ignite name has been retired…", "the programs previously known
--     as Ignite and Amplify have been retired…", "While terms like ignite and amplify…",
--     "The Blue Door and previous self-led courses are retired…" or "retired self-guided
--     courses" (/partner/ignite, /partner/amplify, /partner/amplify/labs,
--     /partner/amplify/stractical-leader/enroll, /wfh-sign-up), including "What happened to
--     the Ignite and Amplify programs? … they are no longer used as specific program names";
--   * the /partner/ignite/courses summary says "previous programs like the Blue Door are
--     retired";
--   * /blue-door and /blue-door/purchase, which only redirect, were regenerated: their FAQs
--     call the Blue Door "a $1,500 strategic appraisal".
-- The generator's brand context now says to describe only what's offered now and never to
-- say anything was retired (generate-page-seo, same pull request).
--
-- This migration:
--   1. keeps a full copy of every row it changes in page_seo_archive;
--   2. clears every text override on /blue-door and /blue-door/purchase (they only
--      redirect; /blue-door/success still serves existing buyers and is left alone);
--   3. elsewhere, removes only the FAQ answers and keywords, and clears only the titles,
--      descriptions and summaries, that mention the Blue Door or its old price, or say that
--      something was "retired", "previously known as", "no longer used", or "what happened
--      to" an old program.
-- "Ignite", "amplify" and "embody" as ordinary words are left alone (PPS-DEC-0025).
--
-- Tested 2026-11-06 on a copy of all 86 production rows: 8 rows archived (6, plus the two
-- Blue Door addresses), 11 of 318 FAQ answers removed (5 outside the Blue Door addresses),
-- 3 summaries and 2 titles cleared, no other column changed; a second run changes nothing.

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

DROP TABLE IF EXISTS pg_temp.seo_retired_targets;
CREATE TEMP TABLE seo_retired_targets AS
SELECT p.id, p.path IN ('/blue-door', '/blue-door/purchase') AS redirect_only
FROM public.page_seo p
WHERE (
        p.path IN ('/blue-door', '/blue-door/purchase')
        AND (p.title IS NOT NULL OR p.description IS NOT NULL OR p.og_title IS NOT NULL
             OR p.og_description IS NOT NULL OR p.aeo_summary IS NOT NULL OR p.aeo_faqs IS NOT NULL
             OR p.keywords IS NOT NULL)
      )
   OR (
        p.path NOT LIKE '/blue-door%'
        AND concat_ws(' ', p.title, p.description, p.og_title, p.og_description, p.aeo_summary,
                      array_to_string(p.keywords, ' '), p.aeo_faqs::text)
            ~* '(blue door|fifteen hundred|1,500|\mretired\M|previously known as|no longer used|what happened to the|terms like (ignite|amplify))'
      );

-- 1. Archive ------------------------------------------------------------------

INSERT INTO public.page_seo_archive
SELECT p.*, now(),
       CASE WHEN t.redirect_only
            THEN 'Address only redirects; regenerated SEO text described the retired Blue Door (PPS Admin, 2026-11-06).'
            ELSE 'Generated SEO text mentioned retired programs or names (PPS-DEC-0025, PPS Admin 2026-11-06).'
       END
FROM public.page_seo p
JOIN seo_retired_targets t ON t.id = p.id;

-- 2. Redirect-only Blue Door addresses ------------------------------------------

UPDATE public.page_seo p
SET title = NULL,
    description = NULL,
    og_title = NULL,
    og_description = NULL,
    aeo_summary = NULL,
    aeo_faqs = NULL,
    keywords = NULL
FROM seo_retired_targets t
WHERE t.id = p.id
  AND t.redirect_only;

-- 3. Everywhere else ------------------------------------------------------------

UPDATE public.page_seo p
SET title          = CASE WHEN p.title          ~* '(blue door|fifteen hundred|1,500|\mretired\M|previously known as|no longer used|what happened to the|terms like (ignite|amplify))' THEN NULL ELSE p.title END,
    description    = CASE WHEN p.description    ~* '(blue door|fifteen hundred|1,500|\mretired\M|previously known as|no longer used|what happened to the|terms like (ignite|amplify))' THEN NULL ELSE p.description END,
    og_title       = CASE WHEN p.og_title       ~* '(blue door|fifteen hundred|1,500|\mretired\M|previously known as|no longer used|what happened to the|terms like (ignite|amplify))' THEN NULL ELSE p.og_title END,
    og_description = CASE WHEN p.og_description ~* '(blue door|fifteen hundred|1,500|\mretired\M|previously known as|no longer used|what happened to the|terms like (ignite|amplify))' THEN NULL ELSE p.og_description END,
    aeo_summary    = CASE WHEN p.aeo_summary    ~* '(blue door|fifteen hundred|1,500|\mretired\M|previously known as|no longer used|what happened to the|terms like (ignite|amplify))' THEN NULL ELSE p.aeo_summary END,
    keywords = CASE
      WHEN p.keywords IS NULL THEN NULL
      ELSE ARRAY(SELECT k FROM unnest(p.keywords) WITH ORDINALITY AS u(k, n)
                 WHERE k !~* '(blue door|fifteen hundred|1,500|\mretired\M|previously known as|no longer used|what happened to the|terms like (ignite|amplify))' ORDER BY n)
    END,
    aeo_faqs = CASE
      WHEN jsonb_typeof(p.aeo_faqs) = 'array' THEN (
        SELECT coalesce(jsonb_agg(f ORDER BY n), '[]'::jsonb)
        FROM jsonb_array_elements(p.aeo_faqs) WITH ORDINALITY AS e(f, n)
        WHERE f::text !~* '(blue door|fifteen hundred|1,500|\mretired\M|previously known as|no longer used|what happened to the|terms like (ignite|amplify))')
      ELSE p.aeo_faqs
    END
FROM seo_retired_targets t
WHERE t.id = p.id
  AND NOT t.redirect_only;

DROP TABLE IF EXISTS pg_temp.seo_retired_targets;
