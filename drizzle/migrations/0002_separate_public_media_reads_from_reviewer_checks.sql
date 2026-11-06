ALTER POLICY "Public sees published appearances" ON public.media_appearances TO authenticated;
CREATE POLICY "Visitors see approved appearances" ON public.media_appearances FOR SELECT TO anon USING (review_status = 'published');
ALTER POLICY "Public sees published youtube videos" ON public.youtube_videos TO authenticated;
CREATE POLICY "Visitors see approved youtube videos" ON public.youtube_videos FOR SELECT TO anon USING (review_status = 'published');