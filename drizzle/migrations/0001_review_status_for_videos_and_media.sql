ALTER TABLE public.youtube_videos ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'published';
ALTER TABLE public.media_appearances ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'published';
ALTER TABLE public.youtube_videos ADD CONSTRAINT youtube_videos_review_status_check CHECK (review_status IN ('pending','published'));
ALTER TABLE public.media_appearances ADD CONSTRAINT media_appearances_review_status_check CHECK (review_status IN ('pending','published'));

DROP POLICY IF EXISTS "Anyone can view youtube videos" ON public.youtube_videos;
CREATE POLICY "Public sees published youtube videos" ON public.youtube_videos FOR SELECT TO public
  USING (review_status = 'published' OR public.is_admin_or_editor(auth.uid()));

DROP POLICY IF EXISTS "Public can read appearances" ON public.media_appearances;
CREATE POLICY "Public sees published appearances" ON public.media_appearances FOR SELECT TO public
  USING (review_status = 'published' OR public.is_admin_or_editor(auth.uid()));