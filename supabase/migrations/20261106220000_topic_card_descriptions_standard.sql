-- Topic card descriptions follow one standard, two topics merge, and Kick the Habit is reworded
-- (PPS Admin, 2026-11-06).
--
-- The standard, for the description each card on /speaking/topics shows: two sentences, 30–40 words.
-- The first names the tension the audience is living; the second says what they leave able to do. It
-- works for a keynote or a workshop, speaks to the reader, and uses no internal language. The internal
-- offerings registry (pps-ops-hub) keeps its own, more detailed descriptions.
--
--   1. Create Extraordinary Teams (the workshop, workshopCreateExtraordinaryTeams) and From Conflict to
--      Connection become one topic, "From Conflict to Connection: Creating Extraordinary Teams". The workshop row joins the
--      conflict-to-connection topic, takes its cover image, and keeps its place and anchor on /workshops.
--      The From Conflict to Connection Lab keeps its name. The Create Extraordinary Teams course
--      (createExtraordinaryTeams) is not touched: it keeps its own cover.
--   2. Every card's description is replaced by the approved copy. The sync_topic_slug_siblings trigger
--      keeps rows that share a topic_slug identical, so each topic's keynote, workshop and lab rows all
--      take it. Genius at Work's card reads the genius-at-work workshop row; the Working Genius
--      assessment row (working-genius) is left as it is.
--   3. Kick the Habit's new copy is drawn from its free-resource landing page. Its full title and its
--      keynote + workshop formats are set in code (SpeakingWorkshopTopics.tsx).
--
-- Every changed value is kept in path_finder_offerings_text_changes, so the change can be undone:
--   UPDATE public.path_finder_offerings o SET description = t.old_value
--   FROM public.path_finder_offerings_text_changes t
--   WHERE t.offering_id = o.id AND t.column_name = 'description' AND t.reason LIKE 'Topic card standard%';
--   (and the same for name, topic_slug, image_url and blurb).
--
-- Independent of 20261106200000_partner_pages_move_to_top_level.sql; either can run first.
-- Tested 2026-11-06 on a copy of production path_finder_offerings (108 rows) with the trigger: see the PR.
-- A second run changes nothing.

CREATE TABLE IF NOT EXISTS public.path_finder_offerings_text_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_id uuid NOT NULL,
  offering_key text,
  column_name text NOT NULL CHECK (column_name IN ('name', 'description', 'blurb', 'image_url', 'topic_slug')),
  old_value text,
  new_value text,
  changed_at timestamptz NOT NULL DEFAULT now(),
  reason text NOT NULL
);

ALTER TABLE public.path_finder_offerings_text_changes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and editors can read offering text changes" ON public.path_finder_offerings_text_changes;
CREATE POLICY "Admins and editors can read offering text changes"
  ON public.path_finder_offerings_text_changes FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

COMMENT ON TABLE public.path_finder_offerings_text_changes IS
  'Old and new values of offering text rewritten in bulk (names, descriptions, topic merges), so each change can be undone.';

-- The approved card copy, by the card's topic_slug.
CREATE TEMP TABLE pps_topic_copy (slug text PRIMARY KEY, description text NOT NULL);
INSERT INTO pps_topic_copy (slug, description) VALUES
  ('change-for-good', $d$Change efforts rarely fail for lack of will; they stall on hidden competing commitments that quietly protect the status quo. Surface what's holding your team in place, and design the small, safe tests that let real change take hold.$d$),
  ('dont-panic', $d$Change can feel like the galaxy: vast, unpredictable and, once you know where your towel is, mostly harmless. With Douglas Adams' Hitchhiker's Guide as the lens, turn overwhelming transformation into an adventure your people can navigate with humor and perspective.$d$),
  ('driving-change-3-shifts', $d$Organizations in motion aren't automatically moving in the right direction, and many burn energy without building momentum. Change how leaders think about change, how teams relate to it, and how your systems are built to carry it.$d$),
  ('kick-the-habit-b2b', $d$Well-intended change keeps stalling on habits no one sees: the negative thinking patterns and how-we've-always-done-it routines running underneath. Spot them, challenge them, and use curiosity and play to uncover the ideas those habits keep hidden.$d$),
  ('lead-at-speed-of-change', $d$The pace of change has outrun the leadership models built to manage it, and sequential thinking can't keep up. Build leaders who hold strategic clarity, relational trust and sound decisions at once, so they author change instead of chasing it.$d$),
  ('move-shake-innovate', $d$When teams sit still, their thinking tends to stall, and creativity and connection stall with it. Use physical movement to spark new ideas, sharpen problem-solving and bring people back to the present moment.$d$),
  ('shift-happens', $d$Most change efforts stall because organizations try to absorb change instead of authoring it. Get the P.A.T.H.™ framework and the thinking it takes, structurally and culturally, to be ready before the next big change arrives.$d$),
  ('alice-principles', $d$Organizational change can feel like Wonderland, where yesterday's rules stop making sense. Borrow Alice's curiosity, adaptability and habit of questioning the status quo to change how your team meets uncertainty and growth.$d$),
  ('architecture-of-organizational-shift', $d$Many organizations commit to a transformation before knowing whether they're built to carry it. Assess and reinforce the three Painted Porch Pillars™ so your organization navigates uncertainty by design instead of reacting to it.$d$),
  ('path-to-lasting-change', $d$When everyone approaches change differently, transformation stalls in the gaps between them. Build shared fluency in the P.A.T.H.™ framework (Prepare, Align, Take Off and Habits) and apply it to the change your organization faces now.$d$),
  ('eight-by-eight', $d$You have 8 seconds to capture attention and 8 minutes to land the message, and most communicators lose the room in between. Master the neuroscience of the hook and the structure, rhythm and connection that keep people with you.$d$),
  ('borderless-communication', $d$Miscommunication rarely comes from what leaders say; it comes from what others hear. Break down the barriers between intention and understanding, and practice walking a mile in the other person's shoes before you speak.$d$),
  ('get-clear-be-heard', $d$Important messages get lost when they're complicated, crowded or unclear, and teams tune out. Use the C.L.E.A.R. framework to simplify what you say so it earns attention, engagement and action.$d$),
  ('high-fidelity-communication', $d$Static creeps in between what leaders mean and what teams hear, and the signal gets lost. Dial in your message frequency, cut the noise and broadcast a clear signal that resonates with every audience.$d$),
  ('master-your-message-b2b', $d$An announcement email doesn't change behavior, and most change communication stops there. Find your true voice and design the messages, cadences and feedback loops that move people from hearing to doing.$d$),
  ('on-air-ready-confidence', $d$Nerves can undo a strong message before the first word lands, from boardrooms to breakouts. Tame them, take the mic and show up prepared, polished and powerful every time you speak.$d$),
  ('communicator-styles', $d$Every communicator has a natural style, and it connects with some audiences while missing others. Discover yours, then flex across the other five to connect with any room and influence any audience.$d$),
  ('power-of-story', $d$Facts inform, but stories are what people remember and act on, because our brains are wired for them. Know how and when to use narrative to persuade, connect and make your message unforgettable.$d$),
  ('five-minute-keynote', $d$Every leader needs a signature message ready to deliver at a moment's notice, and most don't have one. Craft and rehearse a short, powerful talk that leaves a lasting impression whenever you're handed the mic.$d$),
  ('ai-ei-oh', $d$AI has arrived faster than most people are equipped to absorb it. Use emotional intelligence as the missing link in AI adoption, and lead your team through tech-driven change without leaving anyone behind.$d$),
  ('from-passenger-to-pilot', $d$Many leaders feel like passengers in their own work and lives, carried along on autopilot. Use simple, practical mindfulness tools to take the controls, stay fully present and steer your path with clarity and purpose.$d$),
  ('goldilocks-leadership', $d$Is your leadership style running too hot or too cold for the people you lead? Find your emotional intelligence sweet spot and adjust in the moment, so you become the just-right leader transformation needs.$d$),
  ('leadership-om', $d$When excellence depends on heroic individual effort, organizations stall as they grow more complex. Design a leadership operating model that distributes decisions, communication rhythms and accountability, built for the organization you're becoming.$d$),
  ('stractical-leader', $d$Most leaders are pulled between strategy and tactics, and end up executing decisions instead of shaping them. Work in the integration zone between the two, seeing the trees and guiding the forest at the same time.$d$),
  ('cultivating-change-resilience', $d$People don't resist change; they resist being changed, and teams often treat that pushback as an obstacle. Tell legitimate feedback from fear of the unknown, and build resilience through better messaging, understanding and curiosity.$d$),
  ('finding-joy-at-work', $d$Work can start to feel like a grind, especially in high-pressure environments. Bring purpose, presence and a little play back into your day, and rediscover what makes the work worth doing for you and your team.$d$),
  ('radically-mindful-leadership', $d$Executives who don't have time for mindfulness are often the ones who need it most. Practice simple, practical techniques that build focus, emotional regulation and calm, intentional presence under pressure.$d$),
  ('reigniting-resilience', $d$When the tank runs empty, burnout spreads and engagement drops across the team. Use a simple energy-management framework to refuel resilience, for yourself and your team, and boost engagement and retention.$d$),
  ('stoicism-workplace', $d$When everything around you is changing, it's easy to spend energy on what you can't control. Apply the Stoic principles of reason, logic, purpose and virtue to lead with clarity, resilience and conviction.$d$),
  ('conflict-to-connection', $d$Most team-building treats friction as a symptom to smooth over, so the trust falls fade by Monday. Get to the relational and structural roots of conflict, and build a team that collaborates, challenges and creates together.$d$),
  ('dysfunction-to-dynamic', $d$Silos, eroded trust and stalled collaboration keep capable teams from performing. Break through the silos, rebuild trust and create the kind of collaboration that turns a struggling team into a high-performing one.$d$),
  ('genius-at-work', $d$Teams burn out doing work that drains them. Map the six types of work every project needs with the Working Genius assessment, see who on your team is built for each, and redesign the work around them.$d$),
  ('heroes-assemble', $d$Most teams run on visible talent while their most powerful contributions go unrecognized. Surface each member's distinct superpowers, build the shared language to name them, and design a team where those strengths compound instead of collide.$d$);

-- The merge's target values, read from the From Conflict to Connection workshop row.
CREATE TEMP TABLE pps_topic_merge AS
SELECT $d$From Conflict to Connection: Creating Extraordinary Teams$d$::text AS merged_name,
       'conflict-to-connection'::text AS merged_slug,
       c.image_url AS conflict_image,
       c.blurb AS conflict_blurb,
       (SELECT description FROM pps_topic_copy WHERE slug = 'conflict-to-connection') AS merged_description
FROM public.path_finder_offerings c
WHERE c.offering_key = 'fromConflictToConnection';

-- 1. Log, then merge -----------------------------------------------------------------------

INSERT INTO public.path_finder_offerings_text_changes (offering_id, offering_key, column_name, old_value, new_value, reason)
SELECT o.id, o.offering_key, v.column_name, v.old_value, v.new_value,
       'Topic card standard and merge (PPS Admin, 2026-11-06): Create Extraordinary Teams and From Conflict to Connection become one topic.'
FROM public.path_finder_offerings o
CROSS JOIN pps_topic_merge m
CROSS JOIN LATERAL (VALUES
  ('name', o.name, m.merged_name),
  ('topic_slug', o.topic_slug, CASE WHEN o.offering_key = 'workshopCreateExtraordinaryTeams' THEN m.merged_slug ELSE o.topic_slug END),
  ('image_url', o.image_url, CASE WHEN o.offering_key = 'workshopCreateExtraordinaryTeams' THEN m.conflict_image ELSE o.image_url END),
  ('blurb', o.blurb, CASE WHEN o.offering_key = 'workshopCreateExtraordinaryTeams' THEN m.conflict_blurb ELSE o.blurb END)
) AS v(column_name, old_value, new_value)
WHERE o.offering_key IN ('workshopCreateExtraordinaryTeams', 'fromConflictToConnection')
  AND v.old_value IS DISTINCT FROM v.new_value;

-- Descriptions are logged before anything changes, because the trigger copies them between rows.
INSERT INTO public.path_finder_offerings_text_changes (offering_id, offering_key, column_name, old_value, new_value, reason)
SELECT o.id, o.offering_key, 'description', o.description, c.description,
       'Topic card standard (PPS Admin, 2026-11-06): two sentences, 30–40 words.'
FROM public.path_finder_offerings o
JOIN pps_topic_copy c
  ON c.slug = CASE WHEN o.offering_key = 'workshopCreateExtraordinaryTeams' THEN 'conflict-to-connection' ELSE o.topic_slug END
WHERE o.description IS DISTINCT FROM c.description;

UPDATE public.path_finder_offerings o
SET name = m.merged_name,
    topic_slug = m.merged_slug,
    image_url = m.conflict_image,
    blurb = m.conflict_blurb,
    description = m.merged_description
FROM pps_topic_merge m
WHERE o.offering_key = 'workshopCreateExtraordinaryTeams'
  AND (o.name, o.topic_slug, o.image_url, o.blurb, o.description)
      IS DISTINCT FROM (m.merged_name, m.merged_slug, m.conflict_image, m.conflict_blurb, m.merged_description);

UPDATE public.path_finder_offerings o
SET name = m.merged_name
FROM pps_topic_merge m
WHERE o.offering_key = 'fromConflictToConnection'
  AND o.name IS DISTINCT FROM m.merged_name;

-- 2. Every card's description -----------------------------------------------------------------

UPDATE public.path_finder_offerings o
SET description = c.description
FROM pps_topic_copy c
WHERE o.topic_slug = c.slug
  AND o.description IS DISTINCT FROM c.description;

DROP TABLE pps_topic_copy;
DROP TABLE pps_topic_merge;
