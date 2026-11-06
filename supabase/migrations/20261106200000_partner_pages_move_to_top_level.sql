-- The pages under /partner/ignite and /partner/amplify move to top-level addresses
-- (PPS-DEC-0025 amendment, PPS Admin 2026-11-06). Run this BEFORE publishing the release
-- that moves them, so the new addresses are Live the moment they ship.
--
--   /partner/ignite/assessments[/working-genius]   -> /assessments[/working-genius]
--   /partner/ignite/masterclasses, /partner/ignite/courses -> /masterclasses
--   /partner/amplify/workshops                     -> /workshops
--   /partner/amplify/labs                          -> /leadership-labs
--   /partner/amplify/stractical-leader[/enroll]    -> /leadership-labs/stractical-leader[/enroll]
--   /partner/amplify/sprints -> /architect-shift; /partner/embody -> /embody-shift (they already forward)
--
-- This migration:
--   1. page_status: Live rows for the new addresses (copied from the old rows), and for the
--      shortcuts that forward to them (/ignite, /amplify, /courses, /masterclass, /labs,
--      /programs, /stracticalleader), which had no row and showed "Painting this porch".
--      The old /partner rows stay Live so their forwards keep working.
--   2. page_seo: each moved page's stored SEO text is copied to its new address (where the
--      new address has none yet), with the old address rewritten inside it.
--   3. path_finder_offerings: current_url and dedicated_url move to the new addresses,
--      keeping any #anchor. Every changed value is kept in
--      path_finder_offerings_url_moves, so the move can be undone:
--        UPDATE public.path_finder_offerings o SET current_url = m.old_value
--        FROM public.path_finder_offerings_url_moves m
--        WHERE m.offering_id = o.id AND m.column_name = 'current_url';
--      (and the same for dedicated_url).
--
-- Tested 2026-11-06 on copies of production page_status, page_seo (90 rows) and
-- path_finder_offerings (108 rows): see the pull request. A second run changes nothing.

-- A path rewrite shared by the steps below; dropped at the end.
CREATE OR REPLACE FUNCTION pg_temp.pps_moved_path(p text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN p IS NULL THEN NULL ELSE
    regexp_replace(
    regexp_replace(regexp_replace(regexp_replace(regexp_replace(
    regexp_replace(regexp_replace(regexp_replace(regexp_replace(p,
      '((?:https?://[^/"]+)?)/partner/amplify/stractical-leader(?=$|[/#?"])', '\1/leadership-labs/stractical-leader', 'g'),
      '((?:https?://[^/"]+)?)/partner/ignite/assessments(?=$|[/#?"])', '\1/assessments', 'g'),
      '((?:https?://[^/"]+)?)/partner/ignite/(?:masterclasses|courses)(?=$|[/#?"])', '\1/masterclasses', 'g'),
      '((?:https?://[^/"]+)?)/partner/amplify/workshops(?=$|[/#?"])', '\1/workshops', 'g'),
      '((?:https?://[^/"]+)?)/partner/amplify/labs(?=$|[/#?"])', '\1/leadership-labs', 'g'),
      '((?:https?://[^/"]+)?)/partner/amplify/sprints(?=$|[/#?"])', '\1/architect-shift', 'g'),
      '((?:https?://[^/"]+)?)/partner/embody(?=$|[/#?"])', '\1/embody-shift', 'g'),
      '((?:https?://[^/"]+)?)/partner/ignite(?=$|[#?"])', '\1/assessments', 'g'),
      '((?:https?://[^/"]+)?)/partner/amplify(?=$|[#?"])', '\1/workshops', 'g')
  END
$$;

-- 1. page_status -----------------------------------------------------------------

INSERT INTO public.page_status (path, status, note)
SELECT m.new_path, s.status,
       'Moved from ' || m.old_path || ' (PPS-DEC-0025 amendment, 2026-11-06).'
FROM (VALUES
  ('/partner/ignite/assessments', '/assessments'),
  ('/partner/ignite/assessments/working-genius', '/assessments/working-genius'),
  ('/partner/ignite/masterclasses', '/masterclasses'),
  ('/partner/amplify/workshops', '/workshops'),
  ('/partner/amplify/labs', '/leadership-labs'),
  ('/partner/amplify/stractical-leader', '/leadership-labs/stractical-leader'),
  ('/partner/amplify/stractical-leader/enroll', '/leadership-labs/stractical-leader/enroll')
) AS m(old_path, new_path)
JOIN public.page_status s ON s.path = m.old_path
ON CONFLICT (path) DO NOTHING;

INSERT INTO public.page_status (path, status, note)
SELECT shortcut, 'live', 'Shortcut that forwards to a moved page (PPS-DEC-0025 amendment, 2026-11-06).'
FROM unnest(ARRAY['/ignite', '/amplify', '/courses', '/masterclass', '/labs', '/programs', '/stracticalleader']) AS shortcut
ON CONFLICT (path) DO NOTHING;

-- 2. page_seo ----------------------------------------------------------------------

INSERT INTO public.page_seo (path, title, description, keywords, canonical, robots, og_title,
                             og_description, og_image, jsonld, aeo_summary, aeo_faqs)
SELECT m.new_path, p.title, p.description, p.keywords, pg_temp.pps_moved_path(p.canonical), p.robots,
       p.og_title, p.og_description, p.og_image,
       CASE WHEN p.jsonld IS NULL THEN NULL ELSE pg_temp.pps_moved_path(p.jsonld::text)::jsonb END,
       p.aeo_summary,
       CASE WHEN p.aeo_faqs IS NULL THEN NULL ELSE pg_temp.pps_moved_path(p.aeo_faqs::text)::jsonb END
FROM (VALUES
  ('/partner/ignite/assessments', '/assessments'),
  ('/partner/ignite/assessments/working-genius', '/assessments/working-genius'),
  ('/partner/ignite/masterclasses', '/masterclasses'),
  ('/partner/amplify/workshops', '/workshops'),
  ('/partner/amplify/labs', '/leadership-labs'),
  ('/partner/amplify/stractical-leader', '/leadership-labs/stractical-leader'),
  ('/partner/amplify/stractical-leader/enroll', '/leadership-labs/stractical-leader/enroll')
) AS m(old_path, new_path)
JOIN public.page_seo p ON p.path = m.old_path
WHERE NOT EXISTS (SELECT 1 FROM public.page_seo n WHERE n.path = m.new_path);

-- 3. path_finder_offerings -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.path_finder_offerings_url_moves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_id uuid NOT NULL,
  offering_key text,
  column_name text NOT NULL CHECK (column_name IN ('current_url', 'dedicated_url')),
  old_value text NOT NULL,
  new_value text NOT NULL,
  moved_at timestamptz NOT NULL DEFAULT now(),
  reason text NOT NULL
);

ALTER TABLE public.path_finder_offerings_url_moves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and editors can read offering URL moves" ON public.path_finder_offerings_url_moves;
CREATE POLICY "Admins and editors can read offering URL moves"
  ON public.path_finder_offerings_url_moves FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

COMMENT ON TABLE public.path_finder_offerings_url_moves IS
  'Old and new values of offering links rewritten when pages moved address, so each move can be undone.';

INSERT INTO public.path_finder_offerings_url_moves (offering_id, offering_key, column_name, old_value, new_value, reason)
SELECT o.id, o.offering_key, c.column_name, c.old_value, pg_temp.pps_moved_path(c.old_value),
       'Pages under /partner/ignite and /partner/amplify moved to top-level addresses (PPS-DEC-0025 amendment, 2026-11-06).'
FROM public.path_finder_offerings o
CROSS JOIN LATERAL (VALUES ('current_url', o.current_url), ('dedicated_url', o.dedicated_url)) AS c(column_name, old_value)
WHERE c.old_value IS NOT NULL
  AND pg_temp.pps_moved_path(c.old_value) IS DISTINCT FROM c.old_value;

UPDATE public.path_finder_offerings o
SET current_url = pg_temp.pps_moved_path(o.current_url),
    dedicated_url = pg_temp.pps_moved_path(o.dedicated_url)
WHERE pg_temp.pps_moved_path(o.current_url) IS DISTINCT FROM o.current_url
   OR pg_temp.pps_moved_path(o.dedicated_url) IS DISTINCT FROM o.dedicated_url;

DROP FUNCTION IF EXISTS pg_temp.pps_moved_path(text);
