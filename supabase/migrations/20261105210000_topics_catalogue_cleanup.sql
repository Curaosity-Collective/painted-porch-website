-- Status: Applied via Lovable; confirmed live through the public API on 2026-11-09 (PPS-DEC-0029).
--
-- Topics catalogue cleanup (PPS Admin, 2026-11-05; painted-porch-website PR #4).
--
-- Rule: a topic offered as both a keynote and a workshop shows once, with both
-- labels. The pages already merge sibling rows by topic_slug; this removes the
-- rows that still leaked old wording into titles, and records two decisions.
--
--   1. Archive, then remove, nine superseded duplicate topic rows. They were
--      inserted on 2026-07-01 from the Ops Hub catalog (offerings_unified) under
--      that catalog's older names. None is live, published, featured on the
--      Workshops page, on a speaker page or marked as a keynote. Each surviving
--      sibling already has its own image, so nothing needs copying.
--   2. Rename pathToLastingChange to "The P.A.T.H. to Lasting Change".
--   3. Take Architect Change off the Workshops page. It is the workshop inside
--      the Architect ShIFt engagement, not a standalone workshop. The row is
--      kept and routed to /speaking/topics, as the build's routing check
--      (scripts/validate-workshop-routing.mjs) requires of any workshop row
--      that is not featured. The Topics page excludes it by slug and by name.
--
-- Reversible: step 1 keeps a full copy of each row in
-- path_finder_offerings_archive (admins and editors can read it). To restore
-- one row:
--   INSERT INTO public.path_finder_offerings
--   SELECT (jsonb_populate_record(NULL::public.path_finder_offerings, to_jsonb(a))).*
--   FROM public.path_finder_offerings_archive a WHERE a.offering_key = '<key>';
--
-- Idempotent: safe to run more than once.
--
-- Note for /admin: the Op Platform resync panel matches rows by name. After
-- this runs, it will list the catalog's older names (for example "Working
-- Genius" or "The P.A.T.H. to Navigating Change") as missing locally. Do not
-- insert them again; they are the duplicates removed here.

-- 1. Archive, then remove, the duplicate rows ---------------------------------

CREATE TABLE IF NOT EXISTS public.path_finder_offerings_archive (
  LIKE public.path_finder_offerings INCLUDING DEFAULTS,
  archived_at timestamptz NOT NULL DEFAULT now(),
  archived_reason text NOT NULL,
  superseded_by text,
  PRIMARY KEY (id)
);

ALTER TABLE public.path_finder_offerings_archive ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and editors can read archived offerings" ON public.path_finder_offerings_archive;
CREATE POLICY "Admins and editors can read archived offerings"
  ON public.path_finder_offerings_archive FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

COMMENT ON TABLE public.path_finder_offerings_archive IS
  'Rows removed from path_finder_offerings, kept so each removal can be undone. superseded_by names the offering_key that replaced the row.';

WITH retired(offering_key, superseded_by) AS (
  VALUES
    ('the-p-a-t-h-to-navigating-change', 'pathToLastingChange'),
    ('working-genius', 'geniusAtWork'),
    ('driving-change-the-3-shifts-for-acceleration-evolution', 'drivingChange3Shifts'),
    ('heroes-assemble-discover-the-hidden-superpowers-for-team-success', 'heroesAssemble'),
    ('architect-change-phase-zero-strategic-design', 'architectChange'),
    ('8-8-capture-keep-attention-in-an-8-second-world', 'eightByEight'),
    ('lead-at-the-speed-of-change-leading-change', 'leadAtSpeed'),
    ('shift-happens-be-ready', 'shiftHappensBeReady'),
    ('the-power-of-story-the-art-of-storytelling', 'powerOfStory')
)
INSERT INTO public.path_finder_offerings_archive
SELECT o.*,
       now(),
       'Duplicate topic row (PPS Admin, 2026-11-05, topics catalogue cleanup): a topic shows once, under its current name.',
       r.superseded_by
FROM public.path_finder_offerings o
JOIN retired r ON r.offering_key = o.offering_key
ON CONFLICT (id) DO NOTHING;

-- Only rows already copied to the archive are removed.
DELETE FROM public.path_finder_offerings o
USING public.path_finder_offerings_archive a
WHERE a.id = o.id
  AND a.offering_key IN (
    'the-p-a-t-h-to-navigating-change',
    'working-genius',
    'driving-change-the-3-shifts-for-acceleration-evolution',
    'heroes-assemble-discover-the-hidden-superpowers-for-team-success',
    'architect-change-phase-zero-strategic-design',
    '8-8-capture-keep-attention-in-an-8-second-world',
    'lead-at-the-speed-of-change-leading-change',
    'shift-happens-be-ready',
    'the-power-of-story-the-art-of-storytelling'
  );

-- 2. The P.A.T.H. to Lasting Change ------------------------------------------

UPDATE public.path_finder_offerings
SET name = 'The P.A.T.H. to Lasting Change'
WHERE offering_key = 'pathToLastingChange'
  AND name IS DISTINCT FROM 'The P.A.T.H. to Lasting Change';

-- 3. Architect Change off the Workshops page ----------------------------------

UPDATE public.path_finder_offerings
SET include_in_workshops = false,
    current_url = '/speaking/topics',
    notes = concat_ws(
      E'\n',
      nullif(notes, ''),
      'PPS Admin, 2026-11-05: off the Workshops page. Architect Change is the workshop inside the Architect ShIFt engagement, not a standalone workshop. Was current_url /partner/amplify/workshops.'
    )
WHERE offering_key = 'architectChange'
  AND include_in_workshops;
