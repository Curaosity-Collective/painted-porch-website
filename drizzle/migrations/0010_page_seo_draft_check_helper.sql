CREATE OR REPLACE FUNCTION public.is_unpublished_path(_path text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.page_status WHERE path = _path AND status <> 'live')
$$;
GRANT EXECUTE ON FUNCTION public.is_unpublished_path(text) TO anon, authenticated;
DROP POLICY IF EXISTS "Public can read seo for non-draft pages" ON public.page_seo;
DROP POLICY IF EXISTS "Signed-in can read seo for non-draft pages or staff" ON public.page_seo;
CREATE POLICY "Public can read seo for live pages" ON public.page_seo
  FOR SELECT TO anon USING (NOT public.is_unpublished_path(path));
CREATE POLICY "Signed-in can read seo for live pages or staff" ON public.page_seo
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()) OR NOT public.is_unpublished_path(path));