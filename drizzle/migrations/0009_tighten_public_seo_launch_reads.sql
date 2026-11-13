DROP POLICY IF EXISTS "Anyone can read page seo" ON public.page_seo;
CREATE POLICY "Public can read seo for non-draft pages" ON public.page_seo
  FOR SELECT TO anon
  USING (NOT EXISTS (SELECT 1 FROM public.page_status ps WHERE ps.path = page_seo.path AND ps.status <> 'live'));
CREATE POLICY "Signed-in can read seo for non-draft pages or staff" ON public.page_seo
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()) OR NOT EXISTS (SELECT 1 FROM public.page_status ps WHERE ps.path = page_seo.path AND ps.status <> 'live'));

DROP POLICY IF EXISTS "Anyone can read course launch status" ON public.course_launch_status;
CREATE POLICY "Public can read announced course launches" ON public.course_launch_status
  FOR SELECT TO anon
  USING (status IN ('coming_soon','live'));
CREATE POLICY "Signed-in can read announced launches or admin all" ON public.course_launch_status
  FOR SELECT TO authenticated
  USING (status IN ('coming_soon','live') OR public.is_admin(auth.uid()));