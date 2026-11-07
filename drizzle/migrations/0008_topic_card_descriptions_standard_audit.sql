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
GRANT SELECT ON public.path_finder_offerings_text_changes TO authenticated;
GRANT ALL ON public.path_finder_offerings_text_changes TO service_role;
ALTER TABLE public.path_finder_offerings_text_changes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins and editors can read offering text changes" ON public.path_finder_offerings_text_changes;
CREATE POLICY "Admins and editors can read offering text changes" ON public.path_finder_offerings_text_changes FOR SELECT TO authenticated USING (public.is_admin_or_editor(auth.uid()));
COMMENT ON TABLE public.path_finder_offerings_text_changes IS 'Old and new values of offering text rewritten in bulk (names, descriptions, topic merges), so each change can be undone.';